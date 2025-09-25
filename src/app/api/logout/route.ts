import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Clear the auth token cookie with all relevant attributes
        const response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
        response.cookies.set("token", "", {
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Error during logout" },
            { status: 500 }
        );
    }
}
