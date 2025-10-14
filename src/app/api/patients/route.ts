import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // PostgreSQL connection
import { getAuthenticatedUser } from "@/lib/auth";
import { PatientResponse, CreatePatientDto } from "@/dto/patient.dto";
import bcrypt from "bcrypt";

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
            case "Admin":
                // Admin: gets all patients
                query += `WHERE u.type = 'Patient'`;
                break;
            case "Physician":
                // Physician: gets their assigned patients from physician_patients table
                query += `
          INNER JOIN physician_patients pp ON u.id = pp.patient_id
          WHERE u.type = 'Patient' 
          AND pp.physician_id = $1 
          AND pp.is_active = true
        `;
                queryParams.push(user.id);
                break;
            case "Patient":
                // Patients can only see themselves, redirect to specific endpoint
                return NextResponse.json(
                    {
                        error: "Patients should use /api/patients/{id} endpoint",
                    },
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

        const patients: PatientResponse[] = result.rows.map(
            (p: Record<string, unknown>) => ({
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
                age: p.date_of_birth
                    ? Math.floor(
                          (new Date().getTime() -
                              new Date(p.date_of_birth as string).getTime()) /
                              (1000 * 60 * 60 * 24 * 365)
                      )
                    : undefined,
                medical_history_id: p.medical_history_id,
            })
        );

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
export async function POST(request: NextRequest) {
    try {
        // TODO: Add authorization check here if needed
        // const user = getAuthenticatedUser(request);

        const body: CreatePatientDto = await request.json();

        // Validate required user fields
        if (!body.fname || !body.lname || !body.email || !body.username) {
            return NextResponse.json(
                {
                    error: "First name, last name, email, and username are required",
                },
                { status: 400 }
            );
        }

        // Validate required medical history fields
        if (!body.date_of_birth || !body.gender) {
            return NextResponse.json(
                { error: "Date of birth and gender are required" },
                { status: 400 }
            );
        }

        // Hash password - use "password" as default if not provided
        const hashedPassword = await bcrypt.hash(
            body.password || "password",
            12
        );

        // Begin transaction
        await pool.query("BEGIN");

        try {
            // 1. Create user record
            const userInsertQuery = `
        INSERT INTO users (
          fname, lname, email, phone, username, password, type,
          address, insurance_provider, policy_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

            const userValues = [
                body.fname,
                body.lname,
                body.email,
                body.phone || null,
                body.username,
                hashedPassword,
                "Patient", // Always create as Patient type
                body.address || null,
                body.insurance_provider || null,
                body.policy_number || null,
            ];

            const userResult = await pool.query(userInsertQuery, userValues);
            const newUserId = userResult.rows[0].id;

            // 2. Create medical_history record
            const medicalInsertQuery = `
        INSERT INTO medical_history (
          user_id, date_of_birth, height_in, weight_lbs, gender,
          primary_care_physician, emergency_contact, blood_type,
          allergies, history, last_visit, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

            const medicalValues = [
                newUserId,
                body.date_of_birth,
                body.height_in || null,
                body.weight_lbs || null,
                body.gender,
                body.primary_care_physician || null,
                body.emergency_contact || null,
                body.blood_type || null,
                body.allergies || null,
                body.history || null,
                body.last_visit || new Date(),
                body.status || "Active",
            ];

            await pool.query(medicalInsertQuery, medicalValues);

            // 3. If primary_care_physician is provided, find the physician and create assignment
            if (body.primary_care_physician) {
                // Find physician by full name
                const physicianQuery = `
          SELECT id FROM users 
          WHERE CONCAT(fname, ' ', lname) = $1 AND type = 'Physician'
          LIMIT 1
        `;
                const physicianResult = await pool.query(physicianQuery, [
                    body.primary_care_physician,
                ]);

                if (physicianResult.rows.length > 0) {
                    const physicianId = physicianResult.rows[0].id;

                    // Create physician-patient assignment
                    const assignmentQuery = `
            INSERT INTO physician_patients (physician_id, patient_id, is_active)
            VALUES ($1, $2, true)
          `;
                    await pool.query(assignmentQuery, [physicianId, newUserId]);
                }
            }

            // 4. Fetch the complete patient record
            const patientQuery = `
        SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
               u.insurance_provider, u.policy_number,
               mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
               mh.gender, mh.primary_care_physician, mh.emergency_contact, 
               mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
        FROM users u
        LEFT JOIN medical_history mh ON u.id = mh.user_id
        WHERE u.id = $1
      `;
            const patientResult = await pool.query(patientQuery, [newUserId]);

            // Commit transaction
            await pool.query("COMMIT");

            const patient = patientResult.rows[0];
            const patientResponse: PatientResponse = {
                ...patient,
                age: patient.date_of_birth
                    ? Math.floor(
                          (new Date().getTime() -
                              new Date(patient.date_of_birth).getTime()) /
                              (1000 * 60 * 60 * 24 * 365)
                      )
                    : undefined,
            };

            return NextResponse.json(patientResponse, { status: 201 });
        } catch (error) {
            // Rollback transaction on error
            await pool.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error("Error creating patient:", error);

        // Check for unique constraint violations
        if (error instanceof Error && "code" in error) {
            const pgError = error as { code: string; constraint?: string };
            if (pgError.code === "23505") {
                // Unique violation
                if (pgError.constraint?.includes("email")) {
                    return NextResponse.json(
                        { error: "Email already exists" },
                        { status: 409 }
                    );
                }
                if (pgError.constraint?.includes("username")) {
                    return NextResponse.json(
                        { error: "Username already exists" },
                        { status: 409 }
                    );
                }
            }
        }

        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }
}

// 🟠 PUT: Update an existing patient
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Patient ID is required" },
                { status: 400 }
            );
        }

        // build dynamic SET clause for only provided fields
        const fields = Object.entries(body)
            .filter(([key, value]) => key !== "id" && value !== undefined)
            .map(([key, value], index) => ({
                clause: `${key} = $${index + 1}`,
                value,
            }));

        if (fields.length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
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
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ patient: result.rows[0] });
    } catch (error) {
        console.error("Error updating patient:", error);
        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}

// 🔴 DELETE: Remove a patient
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Patient ID required" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "DELETE FROM patients WHERE id=$1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Error deleting patient:", error);
        return NextResponse.json(
            { error: "Failed to delete patient" },
            { status: 500 }
        );
    }
}
