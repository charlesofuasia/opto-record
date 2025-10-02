import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { UpdateUserDto } from "@/dto/user.dto";
import { getAuthenticatedUser, canAccessUserData } from "@/lib/auth";

// GET user by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = await params;

        // Allow users to get their own data, or admins to get any user's data
        if (!canAccessUserData(user, id)) {
            return NextResponse.json(
                { error: "Unauthorized to access this user's data" },
                { status: 403 }
            );
        }

        const result = await pool.query(
            `SELECT id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number
             FROM users 
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT (update) user by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = await params;

        // Allow users to update their own data, or admins to update any user's data
        if (!canAccessUserData(user, id)) {
            return NextResponse.json(
                { error: "Unauthorized to update this user's data" },
                { status: 403 }
            );
        }

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
                body.email || "",
                body.username || "",
                id,
            ]);

            if (conflictCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: "Email or username already exists" },
                    { status: 409 }
                );
            }
        }

        // Add user ID for WHERE clause
        updateValues.push(id);

        const updateQuery = `
            UPDATE users 
            SET ${updateFields.join(", ")}
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
}

// DELETE user by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = await params;

        // Allow users to delete their own account, or admins to delete any user
        if (!canAccessUserData(user, id)) {
            return NextResponse.json(
                { error: "Unauthorized to delete this user" },
                { status: 403 }
            );
        }

        // Check if user exists before deletion
        const userCheck = await pool.query(
            `SELECT id, type FROM users WHERE id = $1`,
            [id]
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
            [id]
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
