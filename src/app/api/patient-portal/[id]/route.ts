import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

// --- GET patient by ID ---
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT u.*, 
             mh.id AS medical_history_id,
             mh.date_of_birth, mh.height_in, mh.weight_lbs, mh.gender,
             mh.primary_care_physician, mh.emergency_contact,
             mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = result.rows[0];

     // Normalize type to lowercase for consistency
    if (patient.type) {
      patient.type = patient.type.toLowerCase();
    }

    // Add computed age
    if (patient.date_of_birth) {
      patient.age = Math.floor(
        (new Date().getTime() - new Date(patient.date_of_birth).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
      );
    }

    return NextResponse.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- PUT patient by ID (update) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = getAuthenticatedUser(request);

    // Check if patient exists
    const patientCheck = await pool.query(
      `
      SELECT u.id, mh.id AS medical_history_id
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.id = $1
      `,
      [id]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = patientCheck.rows[0];

    // Permissions: only Admin, Physician (assigned), or the Patient themselves
    let canUpdate = false;
    if (user.type === "Admin") canUpdate = true;
    else if (user.type === "Physician") canUpdate = true; // TODO: filter assigned patients
    else if (user.type === "Patient" && user.id === id) canUpdate = true;

    if (!canUpdate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await pool.query("BEGIN");

    try {
      const userFields = ["fname", "lname", "email", "phone", "address", "insurance_provider", "policy_number"];
      const medicalFields = ["date_of_birth", "height_in", "weight_lbs", "gender", "primary_care_physician", "emergency_contact", "blood_type", "allergies", "history", "last_visit", "status"];

      // Handle password separately
      if (body.password) {
        const hashed = await bcrypt.hash(body.password, 12);
        await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hashed, id]);
      }

      // Update users table
      const userUpdates = Object.entries(body)
        .filter(([k]) => userFields.includes(k))
        .map(([k, v], idx) => `${k}=$${idx + 1}`);
      const userValues = Object.entries(body)
        .filter(([k]) => userFields.includes(k))
        .map(([_, v]) => v);

      if (userUpdates.length > 0) {
        userValues.push(id);
        await pool.query(`UPDATE users SET ${userUpdates.join(", ")} WHERE id=$${userValues.length}`, userValues);
      }

      // Update or create medical_history
      const medUpdates = Object.entries(body)
        .filter(([k]) => medicalFields.includes(k))
        .map(([k, v], idx) => `${k}=$${idx + 1}`);
      const medValues = Object.entries(body)
        .filter(([k]) => medicalFields.includes(k))
        .map(([_, v]) => v);

      if (medUpdates.length > 0) {
        if (patient.medical_history_id) {
          medValues.push(patient.medical_history_id);
          await pool.query(
            `UPDATE medical_history SET ${medUpdates.join(", ")} WHERE id=$${medValues.length}`,
            medValues
          );
        } else {
          const columns = Object.entries(body)
            .filter(([k]) => medicalFields.includes(k))
            .map(([k]) => k)
            .join(", ");
          const placeholders = medValues.map((_, i) => `$${i + 2}`).join(", ");
          await pool.query(
            `INSERT INTO medical_history (user_id, ${columns}) VALUES ($1, ${placeholders})`,
            [id, ...medValues]
          );
        }
      }

      await pool.query("COMMIT");

      // Return updated patient
      const updated = await pool.query(
        `
        SELECT u.*, 
               mh.id AS medical_history_id,
               mh.date_of_birth, mh.height_in, mh.weight_lbs, mh.gender,
               mh.primary_care_physician, mh.emergency_contact,
               mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
        FROM users u
        LEFT JOIN medical_history mh ON u.id = mh.user_id
        WHERE u.id = $1
        `,
        [id]
      );

      const patientData = updated.rows[0];
      if (patientData.date_of_birth) {
        patientData.age = Math.floor(
          (new Date().getTime() - new Date(patientData.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
        );
      }

      return NextResponse.json(patientData);
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error updating patient:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- DELETE patient by ID ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthenticatedUser(request);

    if (user.type !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await pool.query(
      `DELETE FROM users WHERE id=$1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Error deleting patient:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
