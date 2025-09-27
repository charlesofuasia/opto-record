import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { UpdateAppointmentDto } from "../../../../dto/appointment.dto";
import { getAuthenticatedUser } from "../../../../lib/auth";

// GET appointment by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;

        // Get the appointment with user details
        const result = await pool.query(
            `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
                    p.fname as patient_fname, p.lname as patient_lname, p.email as patient_email,
                    ph.fname as physician_fname, ph.lname as physician_lname, ph.email as physician_email
             FROM appointments a 
             LEFT JOIN users p ON a.patient_id = p.id
             LEFT JOIN users ph ON a.physician_id = ph.id
             WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        const appointment = result.rows[0];

        // Check permissions based on role
        let canAccess = false;
        if (user.type === 'Admin') {
            canAccess = true;
        } else if (user.type === 'Patient' && appointment.patient_id === user.id) {
            canAccess = true;
        } else if (user.type === 'Physician' && appointment.physician_id === user.id) {
            canAccess = true;
        }

        if (!canAccess) {
            return NextResponse.json(
                { error: "Unauthorized to access this appointment" },
                { status: 403 }
            );
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT (update) appointment by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;
        const body: UpdateAppointmentDto = await request.json();

        // Get the appointment to check permissions
        const appointmentCheck = await pool.query(
            `SELECT patient_id, physician_id FROM appointments WHERE id = $1`,
            [id]
        );

        if (appointmentCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        const appointment = appointmentCheck.rows[0];

        // Check permissions
        let canUpdate = false;
        if (user.type === 'Admin') {
            canUpdate = true;
        } else if (user.type === 'Physician' && appointment.physician_id === user.id) {
            canUpdate = true;
        } else if (user.type === 'Patient' && appointment.patient_id === user.id) {
            // Patients can only update certain fields
            const allowedFields = ['reason', 'notes'];
            const updateFields = Object.keys(body);
            const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));

            if (hasRestrictedFields) {
                return NextResponse.json(
                    { error: "Patients can only update reason and notes" },
                    { status: 403 }
                );
            }
            canUpdate = true;
        }

        if (!canUpdate) {
            return NextResponse.json(
                { error: "Unauthorized to update this appointment" },
                { status: 403 }
            );
        }

        // Build dynamic query based on provided fields
        const updateFields: string[] = [];
        const updateValues: (string | number | null)[] = [];
        let paramCount = 1;

        // Build the SET clause dynamically
        Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                updateValues.push(value as string | number | null);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: "No fields provided for update" },
                { status: 400 }
            );
        }

        // Add appointment ID for WHERE clause
        updateValues.push(id);

        const updateQuery = `
            UPDATE appointments 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, patient_id, physician_id, appointment_date, reason, status, notes
        `;

        const result = await pool.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE appointment by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;

        // Get the appointment to check permissions
        const appointmentCheck = await pool.query(
            `SELECT patient_id, physician_id FROM appointments WHERE id = $1`,
            [id]
        );

        if (appointmentCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        const appointment = appointmentCheck.rows[0];

        // Only Admins and Physicians can delete appointments
        let canDelete = false;
        if (user.type === 'Admin') {
            canDelete = true;
        } else if (user.type === 'Physician' && appointment.physician_id === user.id) {
            canDelete = true;
        }

        if (!canDelete) {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins and assigned Physicians can delete appointments" },
                { status: 403 }
            );
        }

        // Delete the appointment
        const result = await pool.query(
            `DELETE FROM appointments WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Failed to delete appointment" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Appointment deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}