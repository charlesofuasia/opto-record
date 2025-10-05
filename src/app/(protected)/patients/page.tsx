"use client";

import React, { useEffect, useState } from "react";
import { Edit, Eye, Trash, Plus } from "lucide-react";
import Link from "next/link";
import { routes } from "@/constants/routes";
import { Patient } from "@/types/patient";
import { calculatePatientAge } from "@/helpers/partient.helpers";
import { format } from "date-fns";
import PatientFormModal from "@/app/components/PatientFormModal";

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/patients");
                const data: Patient[] = await res.json();
                setPatients(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (loading) return <p>Loading patients...</p>;

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl mb-2">Patients Page</h1>
                    <p className="mb-6 text-md">Manage patients and view information</p>
                </div>
                <div>
                    <button
                        className="btn-primary"
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="inline h-4 w-4 mr-2" /> Add Patient
                    </button>
                </div>
            </div>

            <div className="card mb-6">
                <input
                    type="text"
                    placeholder="Search patients..."
                    className="border p-2 rounded w-full"
                />
            </div>

            <table className="min-w-full overflow-hidden card">
                <thead className="bg-accent">
                    <tr>
                        <th className="bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                            Patient Name
                        </th>
                        <th className="bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                            Age
                        </th>
                        <th className="bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                            Last Visit
                        </th>
                        <th className="bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                            Status
                        </th>
                        <th className="bg-secondary px-6 py-3 text-left text-sm font-semibold uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {patients?.map?.(patient => (
                        <tr key={patient.id} className="transition-colors">
                            <td className="px-6 py-4 text-sm">
                                {patient.fname} {patient.lname}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {calculatePatientAge(patient.date_of_birth)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                {patient?.last_visit
                                    ? format(new Date(patient.last_visit), "MM/dd/yyyy HH:mm:ss")
                                    : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm">{patient.status}</td>
                            <td className="px-6 py-4 text-sm">
                                <Link
                                    href={routes.PATIENTS_DETAILS.replace(":id", patient.id)}
                                    className="px-3 py-1 text-white rounded-lg text-xs"
                                >
                                    <Eye className="inline h-4 w-4 mr-1 cursor-pointer" />
                                </Link>
                                <button className="px-3 py-1 text-white rounded-lg text-xs">
                                    <Edit className="inline h-4 w-4 mr-1 cursor-pointer" />
                                </button>
                                <button className="px-3 py-1 text-white rounded-lg text-xs">
                                    <Trash className="inline h-4 w-4 mr-1 cursor-pointer" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <PatientFormModal closeModal={() => setIsModalOpen(false)} />
            )}
        </section>
    );
}
