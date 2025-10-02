import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

// GET current user's information
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Get the current user's full information
        const result = await pool.query(
            `SELECT id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number
             FROM users 
             WHERE id = $1`,
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
