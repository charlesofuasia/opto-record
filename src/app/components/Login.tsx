"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message);
                return;
            }

            // JWT is in cookie; no need to store manually
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-md bg-primary">
                {/* Title */}
                <h2 className="text-2xl font-bold text-centermb-6 mb-2">
                    Sign in to Opto Record
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm">
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className=" hover:underline font-medium"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}
