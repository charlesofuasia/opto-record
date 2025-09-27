import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { User } from "@/types/user";

interface LoginRequest {
    username: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();

        // Validate required fields
        if (!body.username || !body.password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Find user by username or email
        const result = await pool.query(
            `SELECT id, fname, lname, email, username, password, type, phone, address, insurance_provider, policy_number
             FROM users 
             WHERE username = $1 OR email = $1`,
            [body.username]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const user: User = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(body.password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Remove password from user object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                type: user.type
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Set the token as an HTTP-only cookie
        const response = NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}