import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Ensure the route is protected by middleware (getAuthenticatedUser will throw if missing)
        const _ = getAuthenticatedUser(request);

        const result = await pool.query(
            `SELECT id, fname, lname, email FROM users WHERE type = 'Physician' ORDER BY fname, lname`
        );

        return NextResponse.json(result.rows);
    } catch (err) {
        console.error("Error fetching physicians:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
