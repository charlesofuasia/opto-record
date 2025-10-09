"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  weekAppointments: number;
  redirect?: string;
}

interface Appointment {
  patient_name: string;
  appointment_date: string;
  reason: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data: DashboardStats & { appointments?: Appointment[] } = await res.json();

        // Handle patient redirect
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }

        setStats({
          totalPatients: data.totalPatients,
          todayAppointments: data.todayAppointments,
          weekAppointments: data.weekAppointments,
        });

        // Optionally fetch today’s appointments (or backend can return)
        const apptRes = await fetch("/api/appointments/today");
        const apptData: Appointment[] = await apptRes.json();
        setAppointments(apptData);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, router]);

  if (!user || loading || !stats) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {user?.fname || user?.username}!
      </h1>

      {/* Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalPatients}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Appointments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.todayAppointments}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Appointments This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.weekAppointments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today’s appointments table */}
      {appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Patient</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{appt.patient_name}</td>
                  <td className="border px-4 py-2">
                    {new Date(appt.appointment_date).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{appt.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
