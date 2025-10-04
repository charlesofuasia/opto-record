"use client";

import React, { useEffect, useState } from "react";
import { Edit, Eye, Trash, Plus } from "lucide-react";
import Link from "next/link";
import { routes } from "@/constants/routes";

interface Patient {
  id: string;
  full_name: string;
  gender: string;
  age: number;
  date_of_registration: string;
  status: string;
  last_visit?: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        setPatients(Array.isArray(data.patients) ? data.patients : []);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <p>Loading patients...</p>;

  return (
    <section>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl mb-2 font-semibold">Patients</h1>
          <p className="text-gray-600">Manage and view registered patients</p>
        </div>
        <Link href="/patients/new">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Patient
          </button>
        </Link>
      </div>

      {/* Search Box */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search patients..."
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Patients Table */}
      <table className="min-w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Gender
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Age
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Date of Registration
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm">{patient.full_name}</td>
              <td className="px-6 py-4 text-sm">{patient.gender}</td>
              <td className="px-6 py-4 text-sm">{patient.age}</td>
              <td className="px-6 py-4 text-sm">
                {patient.date_of_registration}
              </td>
              <td className="px-6 py-4 text-sm">{patient.status}</td>
              <td className="px-6 py-4 text-sm flex gap-3">
                <Link
                  href={routes.PATIENTS_DETAILS.replace(":id", patient.id)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
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
