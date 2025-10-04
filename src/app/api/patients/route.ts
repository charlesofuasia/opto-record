import { NextResponse } from "next/server";
import pool from "@/lib/db"; // PostgreSQL connection
// 🟢 GET: Fetch all patients
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) AS full_name,
        gender,
        date_of_birth,
        status,
        COALESCE(date_of_registration, created_at) AS date_of_registration,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) AS age
      FROM patients
      ORDER BY COALESCE(date_of_registration, created_at) DESC
    `);

    return NextResponse.json({ patients: result.rows });
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
