"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Welcome to Opto Record</h1>
      <p className="mb-8 text-gray-600">
        Manage patient records securely and efficiently.
      </p>

      <div className="space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Register
        </button>
      </div>
    </div>
  );
}
