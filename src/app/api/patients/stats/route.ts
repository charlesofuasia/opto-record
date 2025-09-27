import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "../../../../services/patientService";
import { getAuthenticatedUser } from "../../../../lib/auth";

// GET patient statistics
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only Admins and Physicians can view patient statistics
        if (user.type !== 'Admin' && user.type !== 'Physician') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins and Physicians can view statistics" },
                { status: 403 }
            );
        }

        const stats = await PatientService.getPatientStats();

        return NextResponse.json({
            ...stats,
            avg_age: stats.avg_age ? parseFloat(stats.avg_age) : null
        });
    } catch (error) {
        console.error("Error fetching patient statistics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}