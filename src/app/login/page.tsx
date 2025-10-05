"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);

      // Get the updated user from the store
      const user = useAuthStore.getState().user;

      // Route based on user type
      if (user?.type === "Patient") {
        router.push(`/patient-portal/${user.id}`);
      } else if (user?.type === "Admin") {
        router.push("/dashboard");
      } else if (user?.type === "Physician") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-2xl shadow-md bg-primary w-[300px] lg:w-[500px]">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-6">
            Sign in to Opto Record
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-background"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-success-dark hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}