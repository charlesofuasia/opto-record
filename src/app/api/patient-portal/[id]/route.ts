import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const res = await pool.query(`
      SELECT u.id, u.fname, u.lname, u.email, u.phone, u.address, u.insurance_provider, u.policy_number,
             mh.date_of_birth, mh.gender, mh.blood_type, mh.allergies, mh.primary_care_physician, mh.emergency_contact
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.id = $1;
    `, [id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}