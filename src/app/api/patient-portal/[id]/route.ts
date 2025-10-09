import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Notice the await here

    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
