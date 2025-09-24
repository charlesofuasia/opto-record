// app/api/patients/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT u.id, u.fname, u.lname, mh.date_of_birth, mh.last_visit, mh.status
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.type = 'Patient'
      ORDER BY u.fname, u.lname;
    `);

    const patients = res.rows.map((p) => ({
      id: p.id,
      name: `${p.fname} ${p.lname}`,
      age: Math.floor(
        (new Date().getTime() - new Date(p.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      ),
      lastVisit: p.last_visit ? new Date(p.last_visit).toLocaleDateString() : 'N/A',
      status: p.status || 'Active',
    }));

    return NextResponse.json({ patients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ patients: [], error: 'Failed to fetch patients' }, { status: 500 });
  }
}
