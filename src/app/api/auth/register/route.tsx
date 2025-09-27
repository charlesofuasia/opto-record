import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { CreateUserDto } from "@/dto/user.dto";

export async function POST(request: NextRequest) {
    try {
        const body: CreateUserDto = await request.json();

        // Validate required fields
        const requiredFields = ['fname', 'lname', 'email', 'username', 'password'];
        for (const field of requiredFields) {
            if (!body[field as keyof CreateUserDto]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Check if email or username already exists
        const existingUser = await pool.query(
            `SELECT id FROM users WHERE email = $1 OR username = $2`,
            [body.email, body.username]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: "User with this email or username already exists" },
                { status: 409 }
            );
        }

        // Create the user
        const result = await pool.query(
            `INSERT INTO users (fname, lname, email, phone, username, password, type, address, insurance_provider, policy_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, fname, lname, email, username, type, phone, address, insurance_provider, policy_number`,
            [
                body.fname,
                body.lname,
                body.email,
                body.phone || null,
                body.username,
                hashedPassword,
                "Patient",
                body.address || null,
                body.insurance_provider || null,
                body.policy_number || null
            ]
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                type: newUser.type
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Set the token as an HTTP-only cookie
        const response = NextResponse.json(newUser, { status: 201 });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}