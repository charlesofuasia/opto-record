"use client";

import BirthdayReminder from "@/app/components/BirthdayReminder";
import DoctorAppointments from "@/app/components/DoctorAppointments";
import { useAuthStore } from "@/store/authStore";

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
        </div>
    );
}
