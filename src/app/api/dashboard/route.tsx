import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        return NextResponse.json({
            message: "Welcome to dashboard",
            user: decoded,
        });
    } catch (err) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}
