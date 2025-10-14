"use client";

import BirthdayReminder from "@/app/components/BirthdayReminder";
import DoctorAppointments from "@/app/components/DoctorAppointments";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Welcome, {user?.fname || user?.username} {user?.lname}!
            </h1>
            <DoctorAppointments
                currentUserId={user?.id || ""}
                fetchUrl="/api/appointments"
            />
            <BirthdayReminder />
            <button className="card mt-6 px-4 py-2 text-white rounded">
                <Link
                    href="/register"
                    className="block w-full text-center font-medium"
                >
                    <h2 className="text-lg">Register New Admin/Physician</h2>
                </Link>
            </button>
        </div>
    );
}
