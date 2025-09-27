import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../../lib/auth";
import { MedicalHistoryService } from "../../../../../services/medicalHistoryService";

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const user = getAuthenticatedUser(request);
        const { userId } = params;

        // Check permissions based on role
        let canAccess = false;
        if (user.type === 'Admin') {
            canAccess = true;
        } else if (user.type === 'Patient' && user.id === userId) {
            canAccess = true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to access
            canAccess = true;
        }

        if (!canAccess) {
            return NextResponse.json(
                { error: "Unauthorized to access this patient's medical history" },
                { status: 403 }
            );
        }

        const medicalHistory = await MedicalHistoryService.getMedicalHistoryByUserId(userId);

        if (!medicalHistory) {
            return NextResponse.json(
                { error: "Medical history not found for this patient" },
                { status: 404 }
            );
        }

        return NextResponse.json(medicalHistory);
    } catch (error) {
        console.error("Error fetching medical history by user ID:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}