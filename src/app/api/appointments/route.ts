import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "../../../dto/appointment.dto";
import { getAuthenticatedUser } from "../../../lib/auth";
import { AppointmentService } from "@/services/appointmentService";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const appointments = await AppointmentService.getAppointmentsByRole(
      user
    );
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    // Only Admins and Physicians can create appointments
    if (user.type !== "Admin" && user.type !== "Physician") {
      return NextResponse.json(
        {
          error: "Unauthorized. Only Admins and Physicians can create appointments",
        },
        { status: 403 }
      );
    }

    const body: CreateAppointmentDto = await request.json();

    // Validate required fields
    const requiredFields = [
      "patient_id",
      "physician_id",
      "appointment_date",
    ];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateAppointmentDto]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate that patient_id exists and is a patient
    const patientCheck = await pool.query(
      `SELECT id, type FROM users WHERE id = $1`,
      [body.patient_id]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    if (patientCheck.rows[0].type !== "Patient") {
      return NextResponse.json(
        { error: "Specified user is not a patient" },
        { status: 400 }
      );
    }

    // Validate that physician_id exists and is a physician
    const physicianCheck = await pool.query(
      `SELECT id, type FROM users WHERE id = $1`,
      [body.physician_id]
    );

    if (physicianCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Physician not found" },
        { status: 404 }
      );
    }

    if (physicianCheck.rows[0].type !== "Physician") {
      return NextResponse.json(
        { error: "Specified user is not a physician" },
        { status: 400 }
      );
    }

    // Create the appointment
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, physician_id, appointment_date, reason, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, patient_id, physician_id, appointment_date, reason, status, notes`,
      [
        body.patient_id,
        body.physician_id,
        body.appointment_date,
        body.reason || null,
        body.status || "Scheduled",
        body.notes || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const body: UpdateAppointmentDto & { id: string } =
      await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment to check permissions
    const appointmentCheck = await pool.query(
      `SELECT patient_id, physician_id FROM appointments WHERE id = $1`,
      [body.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = appointmentCheck.rows[0];

    // Check permissions
    let canUpdate = false;
    if (user.type === "Admin") {
      canUpdate = true;
    } else if (
      user.type === "Physician" &&
      appointment.physician_id === user.id
    ) {
      canUpdate = true;
    } else if (
      user.type === "Patient" &&
      appointment.patient_id === user.id
    ) {
      // Patients can only update certain fields
      const allowedFields = ["reason", "notes"];
      const updateFields = Object.keys(body).filter(
        (key) => key !== "id"
      );
      const hasRestrictedFields = updateFields.some(
        (field) => !allowedFields.includes(field)
      );

      if (hasRestrictedFields) {
        return NextResponse.json(
          { error: "Patients can only update reason and notes" },
          { status: 403 }
        );
      }
      canUpdate = true;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Unauthorized to update this appointment" },
        { status: 403 }
      );
    }

    // Build dynamic query based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];
    let paramCount = 1;

    // Build the SET clause dynamically
    Object.entries(body).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value as string | number | null);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // Add appointment ID for WHERE clause
    updateValues.push(body.id);

    const updateQuery = `
            UPDATE appointments 
            SET ${updateFields.join(", ")}
            WHERE id = $${paramCount}
            RETURNING id, patient_id, physician_id, appointment_date, reason, status, notes
        `;

    const result = await pool.query(updateQuery, updateValues);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment to check permissions
    const appointmentCheck = await pool.query(
      `SELECT patient_id, physician_id FROM appointments WHERE id = $1`,
      [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = appointmentCheck.rows[0];

    // Admins, assigned Physicians, and the patient themselves can delete/cancel appointments
    let canDelete = false;
    if (user.type === "Admin") {
      canDelete = true;
    } else if (
      user.type === "Physician" &&
      appointment.physician_id === user.id
    ) {
      canDelete = true;
    } else if (
      user.type === "Patient" &&
      appointment.patient_id === user.id
    ) {
      // Allow patients to cancel their own appointments
      canDelete = true;
    }

    if (!canDelete) {
      return NextResponse.json(
        {
          error: "Unauthorized. Only Admins, assigned Physicians, or the patient can delete this appointment",
        },
        { status: 403 }
      );
    }

    // Delete the appointment
    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 RETURNING id`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}