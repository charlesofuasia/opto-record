import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/auth";
import { MedicalHistoryService } from "../../../../services/medicalHistoryService";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only Admins can access medical history statistics
        if (user.type !== 'Admin') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins can access medical history statistics" },
                { status: 403 }
            );
        }

        const stats = await MedicalHistoryService.getMedicalHistoryStats();

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching medical history statistics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}