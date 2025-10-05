"use client";

import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Welcome, {user?.fname || user?.username}!
            </h1>
        </div>
    );
}
