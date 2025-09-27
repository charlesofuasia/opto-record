import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "../../../../../services/patientService";
import { getAuthenticatedUser } from "../../../../../lib/auth";

// GET patient activity
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        // Check if patient exists
        const patient = await PatientService.getPatientById(id);
        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        // Check permissions based on role
        let canAccess = false;
        if (user.type === 'Admin') {
            canAccess = true;
        } else if (user.type === 'Patient' && patient.id === user.id) {
            canAccess = true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to access
            canAccess = true;
        }

        if (!canAccess) {
            return NextResponse.json(
                { error: "Unauthorized to access this patient's activity" },
                { status: 403 }
            );
        }

        const activity = await PatientService.getPatientActivity(id, limit);

        return NextResponse.json({
            patient_id: id,
            activity,
            count: activity.length
        });
    } catch (error) {
        console.error("Error fetching patient activity:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}