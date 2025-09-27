import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { CreateUserDto, UpdateUserDto } from "@/dto/user.dto";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        switch (user.type) {
            case 'Admin':
                // Admin: receives all users data
                const allUsersResult = await pool.query(
                    `SELECT id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number
                     FROM users 
                     ORDER BY fname, lname`
                );
                return NextResponse.json(allUsersResult.rows);

            case 'Patient':
                // Patient: Only receives their own data
                const patientResult = await pool.query(
                    `SELECT id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number
                     FROM users 
                     WHERE id = $1`,
                    [user.id]
                );

                if (patientResult.rows.length === 0) {
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                return NextResponse.json([patientResult.rows[0]]); // Return as array for consistency

            case 'Physician':
                // Physician: Receives all users attached to them
                // TODO: Implement logic to get patients assigned to this physician
                // This would typically involve a relationship table or a physician_id field
                // For now, return empty array

                /* Future implementation might look like:
                const physicianPatientsResult = await pool.query(
                    `SELECT u.id, u.fname, u.lname, u.email, u.username, u.type, u.phone, u.address, u.insurance_provider, u.policy_number
                     FROM users u 
                     INNER JOIN patient_physician pp ON u.id = pp.patient_id
                     WHERE pp.physician_id = $1 AND u.type = 'Patient'
                     ORDER BY u.fname, u.lname`,
                    [user.id]
                );
                return NextResponse.json(physicianPatientsResult.rows);
                */

                return NextResponse.json([]);

            default:
                // Other role: send an empty array
                return NextResponse.json([]);
        }
    } catch (error) {
        console.error("Error fetching user(s):", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateUserDto = await request.json();

        // Validate required fields
        const requiredFields = ['fname', 'lname', 'email', 'username', 'password', 'type'];
        for (const field of requiredFields) {
            if (!body[field as keyof CreateUserDto]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Check if email or username already exists
        const existingUser = await pool.query(
            `SELECT id FROM users WHERE email = $1 OR username = $2`,
            [body.email, body.username]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: "User with this email or username already exists" },
                { status: 409 }
            );
        }

        // Create the user
        const result = await pool.query(
            `INSERT INTO users (fname, lname, email, phone, username, password, type, address, insurance_provider, policy_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number`,
            [
                body.fname,
                body.lname,
                body.email,
                body.phone || null,
                body.username,
                hashedPassword,
                body.type,
                body.address || null,
                body.insurance_provider || null,
                body.policy_number || null
            ]
        );

        const newUser = result.rows[0];

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const body: UpdateUserDto = await request.json();

        // Build dynamic query based on provided fields
        const updateFields: string[] = [];
        const updateValues: (string | number | null)[] = [];
        let paramCount = 1;

        // Hash password if it's being updated
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 12);
        }

        // Build the SET clause dynamically
        Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                updateValues.push(value);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: "No fields provided for update" },
                { status: 400 }
            );
        }

        // Check if trying to update email/username to an existing one
        if (body.email || body.username) {
            const conflictQuery = `
                SELECT id FROM users 
                WHERE (email = $1 OR username = $2) AND id != $3
            `;
            const conflictCheck = await pool.query(conflictQuery, [
                body.email || '',
                body.username || '',
                user.id
            ]);

            if (conflictCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: "Email or username already exists" },
                    { status: 409 }
                );
            }
        }

        // Add user ID for WHERE clause
        updateValues.push(user.id);

        const updateQuery = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number
        `;

        const result = await pool.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} export async function DELETE(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Check if user exists before deletion
        const userCheck = await pool.query(
            `SELECT id, type FROM users WHERE id = $1`,
            [user.id]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Delete the user (CASCADE will handle related records)
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING id`,
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Failed to delete user" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
