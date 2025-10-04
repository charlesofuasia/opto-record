import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { CreateAppointmentDto, UpdateAppointmentDto } from "@/dto/appointment.dto";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    // Only Admins can view all appointments
    if (!user.type || user.type.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins can view appointments" },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT 
         a.id,
         a.patient_id,
         u.fname || ' ' || u.lname AS patient_name,
         a.primary_care_physician,
         a.appointment_date,
         a.time,
         a.reason,
         a.status,
         a.notes
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       ORDER BY a.appointment_date, a.time`
    );

    return NextResponse.json({ appointments: result.rows });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!["admin", "physician"].includes(user.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins and Physicians can create appointments" },
        { status: 403 }
      );
    }

    const body: CreateAppointmentDto = await request.json();

    // Validate required fields
    const requiredFields = ["patient_id", "primary_care_physician", "appointment_date", "time"];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateAppointmentDto]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate that patient exists
    const patientCheck = await pool.query(
      `SELECT id, type FROM users WHERE id = $1`,
      [body.patient_id]
    );
    if (patientCheck.rows.length === 0 || patientCheck.rows[0].type !== "Patient") {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO appointments 
        (patient_id, primary_care_physician, appointment_date, time, reason, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        body.patient_id,
        body.primary_care_physician,
        body.appointment_date,
        body.time,
        body.reason || null,
        body.status || "Scheduled",
        body.notes || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const body: UpdateAppointmentDto & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    // Get the appointment
    const appointmentCheck = await pool.query(
      `SELECT * FROM appointments WHERE id = $1`,
      [body.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const appointment = appointmentCheck.rows[0];

    // Admins can update everything, others restricted
    let canUpdate = user.type.toLowerCase() === "admin";
    if (!canUpdate) {
      return NextResponse.json({ error: "Unauthorized to update appointment" }, { status: 403 });
    }

    // Build dynamic query
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];
    let paramCount = 1;

    Object.entries(body).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value as string | number | null);
        paramCount++;
      }
    });

    updateValues.push(body.id);

    const updateQuery = `
      UPDATE appointments
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const appointmentCheck = await pool.query(
      `SELECT * FROM appointments WHERE id = $1`,
      [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Only Admin can delete (optional: extend for physician/patient)
    if (user.type.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await pool.query(`DELETE FROM appointments WHERE id = $1`, [appointmentId]);

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
