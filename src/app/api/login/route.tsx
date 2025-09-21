import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const result = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [username]
        );
        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, type: user.type },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Send JWT in HTTP-only cookie
        const response = NextResponse.json({
            message: "Login successful",
            user: { id: user.id, username: user.username, type: user.type },
        });

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60, // 1 hour
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
