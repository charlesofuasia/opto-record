import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser, isAdmin } from '@/lib/auth';

/**
 * GET /api/physician-patients
 * Get physician-patient relationships
 * - Admin: Get all relationships
 * - Physician: Get their assigned patients
 * - Patient: Get their assigned physicians
 */
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const { searchParams } = new URL(request.url);
        const physicianId = searchParams.get('physician_id');
        const patientId = searchParams.get('patient_id');

        let query = `
            SELECT 
                pp.id,
                pp.physician_id,
                pp.patient_id,
                pp.assigned_date,
                pp.is_active,
                pp.notes,
                u1.username as physician_name,
                u1.email as physician_email,
                u2.username as patient_name,
                u2.email as patient_email
            FROM physician_patients pp
            JOIN users u1 ON pp.physician_id = u1.id
            JOIN users u2 ON pp.patient_id = u2.id
            WHERE pp.is_active = true
        `;

        const params: string[] = [];

        if (user.type === 'Physician') {
            // Physicians can only see their own patient assignments
            query += ` AND pp.physician_id = $1`;
            params.push(user.id);
        } else if (user.type === 'Patient') {
            // Patients can only see their own physician assignments
            query += ` AND pp.patient_id = $1`;
            params.push(user.id);
        } else if (user.type === 'Admin') {
            // Admins can filter by physician or patient
            if (physicianId) {
                query += ` AND pp.physician_id = $${params.length + 1}`;
                params.push(physicianId);
            }
            if (patientId) {
                query += ` AND pp.patient_id = $${params.length + 1}`;
                params.push(patientId);
            }
        }

        query += ` ORDER BY pp.assigned_date DESC`;

        const result = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error: unknown) {
        console.error('Error fetching physician-patient relationships:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch relationships'
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/physician-patients
 * Assign a patient to a physician
 * Admin only
 */
export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        if (!isAdmin(user)) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { physician_id, patient_id, notes } = body;

        // Validate required fields
        if (!physician_id || !patient_id) {
            return NextResponse.json(
                { success: false, error: 'physician_id and patient_id are required' },
                { status: 400 }
            );
        }

        // Verify physician exists and is actually a physician
        const physicianCheck = await pool.query(
            'SELECT id, type FROM users WHERE id = $1',
            [physician_id]
        );

        if (physicianCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Physician not found' },
                { status: 404 }
            );
        }

        if (physicianCheck.rows[0].type !== 'Physician') {
            return NextResponse.json(
                { success: false, error: 'User is not a physician' },
                { status: 400 }
            );
        }

        // Verify patient exists and is actually a patient
        const patientCheck = await pool.query(
            'SELECT id, type FROM users WHERE id = $1',
            [patient_id]
        );

        if (patientCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Patient not found' },
                { status: 404 }
            );
        }

        if (patientCheck.rows[0].type !== 'Patient') {
            return NextResponse.json(
                { success: false, error: 'User is not a patient' },
                { status: 400 }
            );
        }

        // Insert relationship (ON CONFLICT will handle duplicates)
        const result = await pool.query(
            `INSERT INTO physician_patients (physician_id, patient_id, notes, is_active)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (physician_id, patient_id) 
             DO UPDATE SET is_active = true, notes = $3, assigned_date = NOW()
             RETURNING *`,
            [physician_id, patient_id, notes || null]
        );

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating physician-patient relationship:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create relationship'
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/physician-patients?id=xxx
 * Remove a physician-patient relationship (soft delete)
 * Admin only
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        if (!isAdmin(user)) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Relationship id is required' },
                { status: 400 }
            );
        }

        // Soft delete by setting is_active to false
        const result = await pool.query(
            'UPDATE physician_patients SET is_active = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Relationship not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Relationship removed successfully'
        });
    } catch (error: unknown) {
        console.error('Error deleting physician-patient relationship:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete relationship'
            },
            { status: 500 }
        );
    }
}
