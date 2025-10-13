"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Dot } from "lucide-react";

interface Patient {
    id: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    address: string | null;
    insurance_provider: string | null;
    policy_number: string | null;
    date_of_birth: string;
    gender: string;
    blood_type: string;
    allergies: string;
    primary_care_physician: string;
    emergency_contact: string;
    type?: string; // 🟢 add this (admin | physician | patient)
}

interface PatientForm extends Partial<Patient> {
    password?: string;
}

export default function PatientPortalPage() {
    const router = useRouter();
    const { id } = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [form, setForm] = useState<PatientForm>({});
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`/api/patient-portal/${id}`);
                const data = await res.json();
                setPatient(data);
                setForm({
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    insurance_provider: data.insurance_provider,
                    policy_number: data.policy_number,
                    date_of_birth: data.date_of_birth,
                    gender: data.gender,
                    blood_type: data.blood_type,
                    allergies: data.allergies,
                    primary_care_physician: data.primary_care_physician,
                    emergency_contact: data.emergency_contact,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPatient();
    }, [id]);

    if (loading) return <p>Loading patient data...</p>;
    if (!patient) return <p>Patient not found.</p>;

    const age = Math.floor(
        (new Date().getTime() - new Date(patient.date_of_birth).getTime()) /
            (1000 * 60 * 60 * 24 * 365)
    );

    // 🟢 Check the type of the record being viewed
    const isAdminOrPhysician =
        patient.type === "admin" || patient.type === "physician";

    return (
        <section className="p-4">
            <div className="card p-6 mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    {isAdminOrPhysician ? "Profile" : "Welcome,"}{" "}
                    {patient.fname} {patient.lname}
                </h1>
                {!isAdminOrPhysician && (
                    <div className="flex items-center gap-4 text-md text-text-secondary">
                        <span>Age: {age}</span>
                        <Dot className="inline h-4 w-4 mr-1" />
                        <span>Patient ID: {patient.id}</span>
                    </div>
                )}
            </div>

            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Personal Information
                </h2>

                {isAdminOrPhysician ? (
                    // 🟢 Simplified view for admin or physician records
                    <div className="grid grid-cols-2 gap-4">
                        <p>
                            <strong>First Name:</strong> {patient.fname}
                        </p>
                        <p>
                            <strong>Last Name:</strong> {patient.lname}
                        </p>
                        <p>
                            <strong>Date of Birth:</strong>{" "}
                            {new Date(
                                patient.date_of_birth
                            ).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Phone:</strong> {patient.phone}
                        </p>
                        <p>
                            <strong>Email:</strong> {patient.email}
                        </p>
                    </div>
                ) : (
                    // 🩵 Normal full patient view
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p>
                                <strong>First Name:</strong> {patient.fname}
                            </p>
                            <p>
                                <strong>Last Name:</strong> {patient.lname}
                            </p>
                            <p>
                                <strong>Date of Birth:</strong>{" "}
                                {new Date(
                                    patient.date_of_birth
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Gender:</strong> {patient.gender}
                            </p>
                            <p>
                                <strong>Phone:</strong> {patient.phone}
                            </p>
                            <p>
                                <strong>Email:</strong> {patient.email}
                            </p>
                            <p>
                                <strong>Address:</strong> {patient.address || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>Blood Type:</strong> {patient.blood_type}
                            </p>
                            <p>
                                <strong>Allergies:</strong> {patient.allergies}
                            </p>
                            <p>
                                <strong>Emergency Contact:</strong>{" "}
                                {patient.emergency_contact}
                            </p>
                            <p>
                                <strong>Insurance Provider:</strong>{" "}
                                {patient.insurance_provider || "N/A"}
                            </p>
                            <p>
                                <strong>Policy Number:</strong>{" "}
                                {patient.policy_number || "N/A"}
                            </p>
                            <p>
                                <strong>Primary Physician:</strong>{" "}
                                {patient.primary_care_physician}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex gap-4">
                    {!editing ? (
                        <>
                        <button
                            className="btn-secondary"
                            onClick={() => setEditing(true)}
                        >
                            Edit Info
                        </button>

                        {!isAdminOrPhysician && (
                            <button
                            className="btn-secondary"
                            onClick={() => router.push("/appointments")}
                            >
                            <Calendar className="inline h-4 w-4 mr-1" /> Schedule Appointment
                            </button>
                        )}
                        </>
                    ) : (
                        <>
                        {isAdminOrPhysician ? (
                        <div className="w-full">
                            <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex flex-col">
                                <span className="mb-1 font-medium">First Name</span>
                                <input
                                    type="text"
                                    value={form.fname || ""}
                                    onChange={(e) => setForm({ ...form, fname: e.target.value })}
                                    className="border p-2 rounded"
                                />
                                </label>
                                <label className="flex flex-col">
                                <span className="mb-1 font-medium">Last Name</span>
                                <input
                                    type="text"
                                    value={form.lname || ""}
                                    onChange={(e) => setForm({ ...form, lname: e.target.value })}
                                    className="border p-2 rounded"
                                />
                                </label>
                            </div>
                            <div>
                                <label className="flex flex-col">
                                <span className="mb-1 font-medium">Phone</span>
                                <input
                                    type="text"
                                    value={form.phone || ""}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="border p-2 rounded"
                                />
                                </label>
                                <label className="flex flex-col">
                                <span className="mb-1 font-medium">Email</span>
                                <input
                                    type="email"
                                    value={form.email || ""}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="border p-2 rounded"
                                />
                                </label>
                            </div>
                            </div>

                            <div className="mt-3 flex gap-3">
                            <button
                                className="btn-primary"
                                onClick={() => setEditing(false)}
                            >
                                Save
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                            </div>
                        </div>
                        ) : (
                        <div className="w-full">
                            ...full patient edit form...
                        </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
