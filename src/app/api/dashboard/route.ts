/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import pool from "../../../lib/db";

export async function GET(req: Request) {
  const client = await pool.connect();
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userType = decoded.type?.toLowerCase();
    const userId = decoded.id;

    let totalPatients = 0;
    let todayAppointments = 0;
    let weekAppointments = 0;

    if (userType === "admin") {
      // Admin — show all patients and all appointments
      const patients = await client.query(
        `SELECT COUNT(*) FROM users WHERE LOWER(type) = 'patient'`
      );
      const today = await client.query(
        `SELECT COUNT(*) FROM appointments
        WHERE appointment_date >= CURRENT_DATE
            AND appointment_date < CURRENT_DATE + INTERVAL '1 day'`
      );

      const week = await client.query(
        `SELECT COUNT(*) FROM appointments 
         WHERE DATE_PART('week', appointment_date) = DATE_PART('week', CURRENT_DATE)
         AND DATE_PART('year', appointment_date) = DATE_PART('year', CURRENT_DATE)`
      );

      totalPatients = Number(patients.rows[0].count);
      todayAppointments = Number(today.rows[0].count);
      weekAppointments = Number(week.rows[0].count);
    } 
    else if (userType === "physician") {
  // Get physician name for matching in medical_history (Dr. Lastname)
    const physician = await client.query(
        `SELECT fname, lname FROM users WHERE id = $1`,
        [userId]
    );
    const fullName = `Dr. ${physician.rows[0].lname}`;

    // Patients where this doctor is primary care physician
    const patients = await client.query(
        `SELECT COUNT(*) FROM medical_history WHERE primary_care_physician = $1`,
        [fullName]
    );

    // Today's appointments for this physician
    const today = await client.query(
        `SELECT COUNT(*) FROM appointments
        WHERE physician_id = $1
        AND appointment_date >= CURRENT_DATE
        AND appointment_date < CURRENT_DATE + INTERVAL '1 day'`,
        [userId]
    );

    // This week’s appointments for this physician
    const week = await client.query(
        `SELECT COUNT(*) FROM appointments 
        WHERE physician_id = $1
        AND DATE_PART('week', appointment_date) = DATE_PART('week', CURRENT_DATE)
        AND DATE_PART('year', appointment_date) = DATE_PART('year', CURRENT_DATE)`,
        [userId]
    );

    totalPatients = Number(patients.rows[0].count);
    todayAppointments = Number(today.rows[0].count);
    weekAppointments = Number(week.rows[0].count);
    }

    else if (userType === "patient") {
      // Patients get redirected to their portal (client handles redirect)
      return NextResponse.json({
        message: "Redirect to patient portal",
        redirect: `/patient-portal/${userId}`,
      });
    } 
    else {
      return NextResponse.json({ message: "Unknown user type" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Dashboard stats retrieved",
      user: decoded,
      totalPatients,
      todayAppointments,
      weekAppointments,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } finally {
    client.release();
  }
}
