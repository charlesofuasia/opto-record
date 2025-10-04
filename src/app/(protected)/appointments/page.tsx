"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash, Plus } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  patient_name: string;
  primary_care_physician: string;
  appointment_date: string;
  time: string;
  reason?: string;
  status: string;
  notes?: string;
}

interface User {
  id: string;
  type: string; // 'Admin', 'Patient', etc.
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
        const checkAuth = async () => {
            try {
            const res = await fetch("/api/users/me");
            if (!res.ok) throw new Error("Not authenticated");
            const user: User = await res.json();

            console.log("Logged-in user:", user);

            // Normalize type to lowercase for comparison
            if (!user.type || user.type.toLowerCase() !== "admin") {
                router.replace("/login");
                return;
            }
            } catch (err) {
            router.replace("/login");
            } finally {
            setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router]);


  useEffect(() => {
    if (checkingAuth) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [checkingAuth]);

  if (checkingAuth || loading) return <p>Loading appointments...</p>;

  return (
    <section>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl mb-2 font-semibold">Appointments</h1>
          <p className="text-gray-600">View and manage patient appointments</p>
        </div>
        <Link href="/appointments/new">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Appointment
          </button>
        </Link>
      </div>

      {/* Search Box */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search appointments..."
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Appointments Table */}
      <table className="min-w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Physician</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Reason</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm">{appt.patient_name}</td>
              <td className="px-6 py-4 text-sm">{appt.primary_care_physician}</td>
              <td className="px-6 py-4 text-sm">{appt.appointment_date}</td>
              <td className="px-6 py-4 text-sm">{appt.time}</td>
              <td className="px-6 py-4 text-sm">{appt.reason || "-"}</td>
              <td className="px-6 py-4 text-sm">{appt.status}</td>
              <td className="px-6 py-4 text-sm flex gap-3">
                <Link href={`/appointments/${appt.id}`} className="text-indigo-600 hover:text-indigo-800">
                  <Eye className="inline h-4 w-4" />
                </Link>
                <button className="text-green-600 hover:text-green-800">
                  <Edit className="inline h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash className="inline h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
