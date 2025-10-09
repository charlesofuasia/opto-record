"use client";

import DoctorAppointments from "@/app/components/DoctorAppointments";
import MakeAppointment from "@/app/components/MakeAppointment";
import UpcomingAppointments from "@/app/components/UpcomingAppointments";
import { useAuthStore } from "@/store/authStore";
import { routes } from "@/constants/routes";
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
            <Link href={routes.REGISTER} className="btn-success">
                Register
            </Link>
        </div>
    );
}
