import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import { CreateMedicalHistoryDto, UpdateMedicalHistoryDto } from "../../../dto/medical-history.dto";
import { getAuthenticatedUser } from "../../../lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        switch (user.type) {
            case 'Admin':
                // Admin: receives all medical histories
                const allMedicalHistoriesResult = await pool.query(
                    `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                            mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                            mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
                            u.fname, u.lname, u.email
                     FROM medical_history mh 
                     LEFT JOIN users u ON mh.user_id = u.id
                     ORDER BY mh.last_visit DESC, u.lname, u.fname`
                );
                return NextResponse.json(allMedicalHistoriesResult.rows);

            case 'Patient':
                // Patient: Only receives their own medical history
                const patientMedicalHistoryResult = await pool.query(
                    `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                            mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                            mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
                     FROM medical_history mh 
                     WHERE mh.user_id = $1`,
                    [user.id]
                );
                return NextResponse.json(patientMedicalHistoryResult.rows);

            case 'Physician':
                // Physician: Receives medical histories of their patients
                // TODO: Implement logic to get patients assigned to this physician
                // For now, return empty array as the relationship table doesn't exist yet

                /* Future implementation might look like:
                const physicianPatientsMedicalHistoryResult = await pool.query(
                    `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                            mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                            mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
                            u.fname, u.lname, u.email
                     FROM medical_history mh 
                     LEFT JOIN users u ON mh.user_id = u.id
                     INNER JOIN patient_physician pp ON mh.user_id = pp.patient_id
                     WHERE pp.physician_id = $1 AND u.type = 'Patient'
                     ORDER BY mh.last_visit DESC, u.lname, u.fname`,
                    [user.id]
                );
                return NextResponse.json(physicianPatientsMedicalHistoryResult.rows);
                */

                return NextResponse.json([]);

            default:
                // Other role: send an empty array
                return NextResponse.json([]);
        }
    } catch (error) {
        console.error("Error fetching medical histories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only Admins and Physicians can create medical histories
        if (user.type !== 'Admin' && user.type !== 'Physician') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins and Physicians can create medical histories" },
                { status: 403 }
            );
        }

        const body: CreateMedicalHistoryDto = await request.json();

        // Validate required fields
        const requiredFields = ['user_id', 'date_of_birth'];
        for (const field of requiredFields) {
            if (!body[field as keyof CreateMedicalHistoryDto]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate that user_id exists and is a patient
        const userCheck = await pool.query(
            `SELECT id, type FROM users WHERE id = $1`,
            [body.user_id]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (userCheck.rows[0].type !== 'Patient') {
            return NextResponse.json(
                { error: "Medical history can only be created for patients" },
                { status: 400 }
            );
        }

        // Check if medical history already exists for this user
        const existingMedicalHistory = await pool.query(
            `SELECT id FROM medical_history WHERE user_id = $1`,
            [body.user_id]
        );

        if (existingMedicalHistory.rows.length > 0) {
            return NextResponse.json(
                { error: "Medical history already exists for this patient" },
                { status: 409 }
            );
        }

        // Validate date_of_birth format
        const dateOfBirth = new Date(body.date_of_birth);
        if (isNaN(dateOfBirth.getTime())) {
            return NextResponse.json(
                { error: "Invalid date_of_birth format" },
                { status: 400 }
            );
        }

        // Create the medical history
        const result = await pool.query(
            `INSERT INTO medical_history (user_id, date_of_birth, height_in, weight_lbs, gender, 
                                        primary_care_physician, emergency_contact, blood_type, 
                                        allergies, history, last_visit, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, user_id, date_of_birth, height_in, weight_lbs, gender, 
                      primary_care_physician, emergency_contact, blood_type, 
                      allergies, history, last_visit, status`,
            [
                body.user_id,
                body.date_of_birth,
                body.height_in || null,
                body.weight_lbs || null,
                body.gender || null,
                body.primary_care_physician || null,
                body.emergency_contact || null,
                body.blood_type || null,
                body.allergies || null,
                body.history || null,
                body.last_visit || new Date(),
                body.status || 'active'
            ]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("Error creating medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const body: UpdateMedicalHistoryDto & { id: string } = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "Medical history ID is required" },
                { status: 400 }
            );
        }

        // Get the medical history to check permissions
        const medicalHistoryCheck = await pool.query(
            `SELECT mh.user_id, u.type as patient_type 
             FROM medical_history mh
             LEFT JOIN users u ON mh.user_id = u.id
             WHERE mh.id = $1`,
            [body.id]
        );

        if (medicalHistoryCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Medical history not found" },
                { status: 404 }
            );
        }

        const medicalHistory = medicalHistoryCheck.rows[0];

        // Check permissions
        let canUpdate = false;
        if (user.type === 'Admin') {
            canUpdate = true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to update (will be restricted when relationship exists)
            canUpdate = true;
        } else if (user.type === 'Patient' && medicalHistory.user_id === user.id) {
            // Patients can update their own medical history
            canUpdate = true;
        }

        if (!canUpdate) {
            return NextResponse.json(
                { error: "Unauthorized to update this medical history" },
                { status: 403 }
            );
        }

        // Build dynamic query based on provided fields
        const updateFields: string[] = [];
        const updateValues: (string | number | Date | null)[] = [];
        let paramCount = 1;

        // Build the SET clause dynamically
        Object.entries(body).forEach(([key, value]) => {
            if (key !== 'id' && value !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                updateValues.push(value as string | number | Date | null);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: "No fields provided for update" },
                { status: 400 }
            );
        }

        // Add medical history ID for WHERE clause
        updateValues.push(body.id);

        const updateQuery = `
            UPDATE medical_history 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, user_id, date_of_birth, height_in, weight_lbs, gender, 
                     primary_care_physician, emergency_contact, blood_type, 
                     allergies, history, last_visit, status
        `;

        const result = await pool.query(updateQuery, updateValues);

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const { searchParams } = new URL(request.url);
        const medicalHistoryId = searchParams.get("id");

        if (!medicalHistoryId) {
            return NextResponse.json(
                { error: "Medical history ID is required" },
                { status: 400 }
            );
        }

        // Get the medical history to check permissions
        const medicalHistoryCheck = await pool.query(
            `SELECT user_id FROM medical_history WHERE id = $1`,
            [medicalHistoryId]
        );

        if (medicalHistoryCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Medical history not found" },
                { status: 404 }
            );
        }

        // Only Admins can delete medical histories (sensitive medical data)
        if (user.type !== 'Admin') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins can delete medical histories" },
                { status: 403 }
            );
        }

        // Delete the medical history
        const result = await pool.query(
            `DELETE FROM medical_history WHERE id = $1 RETURNING id`,
            [medicalHistoryId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Failed to delete medical history" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Medical history deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}