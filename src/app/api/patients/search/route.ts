import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "../../../../services/patientService";
import { getAuthenticatedUser } from "../../../../lib/auth";

// GET search patients
export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const limit = parseInt(searchParams.get("limit") || "20");

        if (!query) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        let results;

        // Apply role-based filtering
        if (user.type === 'Admin') {
            // Admins can search all patients
            results = await PatientService.searchPatients(query, limit);
        } else if (user.type === 'Physician') {
            // TODO: Physicians should only search their assigned patients
            // For now, allow all patients
            results = await PatientService.searchPatients(query, limit);
        } else if (user.type === 'Patient') {
            // Patients can only search for themselves
            results = await PatientService.searchPatients(query, limit);
            results = results.filter((patient: Record<string, unknown>) => patient.id === user.id);
        } else {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            results,
            count: results.length,
            query
        });
    } catch (error) {
        console.error("Error searching patients:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}