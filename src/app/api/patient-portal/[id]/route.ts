import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const res = await pool.query(
            `
      SELECT u.id, u.fname, u.lname, u.email, u.phone, u.address, u.insurance_provider, u.policy_number,
             mh.date_of_birth, mh.gender, mh.blood_type, mh.allergies, mh.primary_care_physician, mh.emergency_contact
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.id = $1
      `,
            [id]
        );

        return NextResponse.json(res.rows[0] ?? {});
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to fetch patient" },
            { status: 500 }
        );
    }
}
