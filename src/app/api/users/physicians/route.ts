import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Ensure the route is protected by middleware (throws if missing)
    await getAuthenticatedUser(request);

    const result = await pool.query(
      `SELECT id, fname, lname, email FROM users WHERE type = 'Admin' ORDER BY fname, lname`
    );

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching physicians:", error.message);
    } else {
      console.error("Unexpected error fetching physicians:", error);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
