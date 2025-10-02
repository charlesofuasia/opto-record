import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { AppointmentService } from "@/services/appointmentService";

export async function POST(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only patients can create appointment requests
        if (user.type !== "Patient") {
            return NextResponse.json(
                { error: "Only patients can request appointments" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const created = await AppointmentService.createAppointment({
            patientId: user.id,
            physicianId: body.physician_id,
            appointmentDate: body.appointment_date,
            reason: body.reason || null,
            status: "Requested",
            notes: null,
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        console.error("Error creating appointment request:", err);

        // Map known validation errors to HTTP statuses
        if (err instanceof Error) {
            const msg = err.message || "";
            if (msg.includes("Patient not found")) {
                return NextResponse.json({ error: msg }, { status: 404 });
            }
            if (msg.includes("Specified user is not a patient")) {
                return NextResponse.json({ error: msg }, { status: 400 });
            }
            if (msg.includes("Physician not found")) {
                return NextResponse.json({ error: msg }, { status: 404 });
            }
            if (msg.includes("Specified user is not a physician")) {
                return NextResponse.json({ error: msg }, { status: 400 });
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
