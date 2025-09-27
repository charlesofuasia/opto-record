import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../../lib/auth";
import { MedicalHistoryService } from "../../../../../services/medicalHistoryService";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only Admins and Physicians can view patients without medical history
        if (user.type !== 'Admin' && user.type !== 'Physician') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins and Physicians can access this information" },
                { status: 403 }
            );
        }

        const patients = await MedicalHistoryService.getPatientsWithoutMedicalHistory();

        return NextResponse.json(patients);
    } catch (error) {
        console.error("Error fetching patients without medical history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}