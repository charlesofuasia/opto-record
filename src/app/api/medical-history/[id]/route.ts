import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { UpdateMedicalHistoryDto } from "../../../../dto/medical-history.dto";
import { getAuthenticatedUser } from "../../../../lib/auth";

// GET medical history by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;

        // Get the medical history with user details
        const result = await pool.query(
            `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                    mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                    mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
                    u.fname, u.lname, u.email, u.type as patient_type
             FROM medical_history mh 
             LEFT JOIN users u ON mh.user_id = u.id
             WHERE mh.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Medical history not found" },
                { status: 404 }
            );
        }

        const medicalHistory = result.rows[0];

        // Check permissions based on role
        let canAccess = false;
        if (user.type === 'Admin') {
            canAccess = true;
        } else if (user.type === 'Patient' && medicalHistory.user_id === user.id) {
            canAccess = true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to access (will be restricted when relationship exists)
            canAccess = true;
        }

        if (!canAccess) {
            return NextResponse.json(
                { error: "Unauthorized to access this medical history" },
                { status: 403 }
            );
        }

        return NextResponse.json(medicalHistory);
    } catch (error) {
        console.error("Error fetching medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT (update) medical history by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;
        const body: UpdateMedicalHistoryDto = await request.json();

        // Get the medical history to check permissions
        const medicalHistoryCheck = await pool.query(
            `SELECT mh.user_id, u.type as patient_type 
             FROM medical_history mh
             LEFT JOIN users u ON mh.user_id = u.id
             WHERE mh.id = $1`,
            [id]
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
            if (value !== undefined) {
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
        updateValues.push(id);

        const updateQuery = `
            UPDATE medical_history 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, user_id, date_of_birth, height_in, weight_lbs, gender, 
                     primary_care_physician, emergency_contact, blood_type, 
                     allergies, history, last_visit, status
        `;

        const result = await pool.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Medical history not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE medical history by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;

        // Get the medical history to check permissions
        const medicalHistoryCheck = await pool.query(
            `SELECT user_id FROM medical_history WHERE id = $1`,
            [id]
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
            [id]
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