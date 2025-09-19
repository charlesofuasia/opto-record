"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Registration() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Perform registration logic here
        // On success:
        router.push("/dashboard");
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h2>Register</h2>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="FullName">Full Name</label>
                    <input type="text" id="FullName" />
                </div>
                <div>
                    <label htmlFor="PhoneNumber">Phone Number</label>
                    <input type="tel" id="PhoneNumber" />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
