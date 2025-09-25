import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { fname, lname, email, phone, username, password } =
            await req.json();

        const existing = await pool.query(
            "SELECT * FROM users WHERE username=$1 OR email=$2",
            [username, email]
        );

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { message: "Username or email already taken" },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (fname, lname, email, phone, username, password, type)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [fname, lname, email, phone, username, hashed, "Patient"]
        );

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
