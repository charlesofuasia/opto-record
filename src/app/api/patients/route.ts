import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // PostgreSQL connection
import { getAuthenticatedUser } from "@/lib/auth";
import { PatientResponse } from "@/dto/patient.dto";

// 🟢 GET: Fetch all patients
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    // Role-based access control
    let query = `
      SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
             u.insurance_provider, u.policy_number,
             mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
             mh.gender, mh.primary_care_physician, mh.emergency_contact, 
             mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
    `;

    const queryParams: string[] = [];

    switch (user.type) {
      case 'Admin':
        // Admin: gets all patients
        query += `WHERE u.type = 'Patient'`;
        break;
      case 'Physician':
        // Physician: gets their assigned patients from physician_patients table
        query += `
          INNER JOIN physician_patients pp ON u.id = pp.patient_id
          WHERE u.type = 'Patient' 
          AND pp.physician_id = $1 
          AND pp.is_active = true
        `;
        queryParams.push(user.id);
        break;
      case 'Patient':
        // Patients can only see themselves, redirect to specific endpoint
        return NextResponse.json(
          { error: "Patients should use /api/patients/{id} endpoint" },
          { status: 403 }
        );
      default:
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
    }

    query += ` ORDER BY u.fname, u.lname`;

    const result = await pool.query(query, queryParams);

    const patients: PatientResponse[] = result.rows.map((p: Record<string, unknown>) => ({
      id: p.id,
      fname: p.fname,
      lname: p.lname,
      email: p.email,
      username: p.username,
      phone: p.phone,
      address: p.address,
      insurance_provider: p.insurance_provider,
      policy_number: p.policy_number,
      date_of_birth: p.date_of_birth,
      height_in: p.height_in,
      weight_lbs: p.weight_lbs,
      gender: p.gender,
      primary_care_physician: p.primary_care_physician,
      emergency_contact: p.emergency_contact,
      blood_type: p.blood_type,
      allergies: p.allergies,
      history: p.history,
      last_visit: p.last_visit,
      status: p.status || "Active",
      age: p.date_of_birth ? Math.floor(
        (new Date().getTime() - new Date(p.date_of_birth as string).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
      ) : undefined,
      medical_history_id: p.medical_history_id
    }));

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}


// 🟡 POST: Add a new patient
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const requiredFields = ["first_name", "last_name", "gender"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      height_in,
      weight_lbs,
      blood_type,
      allergies,
      medical_history,
      last_visit,
      status,
    } = body;

    const query = `
      INSERT INTO patients (
        first_name, last_name, email, phone, date_of_birth, gender,
        address, height_in, weight_lbs, blood_type, allergies,
        medical_history, last_visit, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      height_in,
      weight_lbs,
      blood_type,
      allergies,
      medical_history,
      last_visit,
      status || "Active",
    ];

    const result = await pool.query(query, values);
    return NextResponse.json({ patient: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding patient:", error);
    return NextResponse.json({ error: "Failed to add patient" }, { status: 500 });
  }
}

// 🟠 PUT: Update an existing patient
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // build dynamic SET clause for only provided fields
    const fields = Object.entries(body)
      .filter(([key, value]) => key !== "id" && value !== undefined)
      .map(([key, value], index) => ({
        clause: `${key} = $${index + 1}`,
        value,
      }));

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const setClause = fields.map((f) => f.clause).join(", ");
    const values = fields.map((f) => f.value);
    values.push(id); // for WHERE condition

    const query = `
      UPDATE patients
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

// 🔴 DELETE: Remove a patient
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    const result = await pool.query("DELETE FROM patients WHERE id=$1 RETURNING id", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
