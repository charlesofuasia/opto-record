import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/auth";
import { MedicalHistoryService } from "../../../../services/medicalHistoryService";

export async function GET(request: NextRequest) {
    try {
        const user = getAuthenticatedUser(request);

        // Only Admins and Physicians can search medical histories
        if (user.type !== 'Admin' && user.type !== 'Physician') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins and Physicians can search medical histories" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const searchTerm = searchParams.get("q");

        if (!searchTerm || searchTerm.trim().length < 2) {
            return NextResponse.json(
                { error: "Search term must be at least 2 characters long" },
                { status: 400 }
            );
        }

        const results = await MedicalHistoryService.searchMedicalHistories(searchTerm.trim(), user);

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error searching medical histories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}