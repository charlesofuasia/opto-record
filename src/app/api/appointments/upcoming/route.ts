import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/auth";
import { AppointmentService } from "../../../../services/appointmentService";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const upcomingAppointments = await AppointmentService.getUpcomingAppointments(user);

        return NextResponse.json(upcomingAppointments);
    } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}