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

        const fetchPhysicians = async () => {
            try {
                const res = await fetch(`/api/physicians`);
                const data = await res.json();
                // Handle physician data if needed
            } catch (err) {
                console.error(err);
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

    return (
        <section className="p-4">
            <div className="card p-6 mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome, {patient.fname} {patient.lname}
                </h1>
                <div className="flex items-center gap-4 text-md text-text-secondary">
                    <span>Age: {age}</span>
                    <Dot className="inline h-4 w-4 mr-1" />
                    <span>Patient ID: {patient.id}</span>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Personal Information
                </h2>
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

                <div className="mt-6 flex gap-4 ">
                    {!editing ? (
                        <>
                            <button
                                className="btn-secondary"
                                onClick={() => setEditing(true)}
                            >
                                Edit Info
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => router.push("/appointments")}
                            >
                                <Calendar className="inline h-4 w-4 mr-1" />{" "}
                                Schedule Appointment
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-full">
                                <div className="flex flex-col flex-wrap gap-4">
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Date of birth
                                        </span>
                                        <input
                                            type="date"
                                            className="border p-2 rounded"
                                            value={
                                                form.date_of_birth
                                                    ? form.date_of_birth.slice(
                                                          0,
                                                          10
                                                      )
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    date_of_birth:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Date of birth"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Gender
                                        </span>
                                        <select
                                            className="border p-2 rounded"
                                            value={form.gender || ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    gender: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">
                                                Select Gender
                                            </option>
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Phone
                                        </span>
                                        <input
                                            type="tel"
                                            className="border p-2 rounded"
                                            value={form.phone || ""}
                                            onChange={(e) => {
                                                // Only allow digits, format as (XXX) XXX-XXXX
                                                let raw =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    );
                                                if (raw.length > 10)
                                                    raw = raw.slice(0, 10);
                                                let formatted = raw;
                                                if (raw.length > 6) {
                                                    formatted = `(${raw.slice(
                                                        0,
                                                        3
                                                    )}) ${raw.slice(
                                                        3,
                                                        6
                                                    )}-${raw.slice(6)}`;
                                                } else if (raw.length > 3) {
                                                    formatted = `(${raw.slice(
                                                        0,
                                                        3
                                                    )}) ${raw.slice(3)}`;
                                                } else if (raw.length > 0) {
                                                    formatted = `(${raw}`;
                                                }
                                                setForm({
                                                    ...form,
                                                    phone: formatted,
                                                });
                                            }}
                                            placeholder="(555) 555-5555"
                                            maxLength={14}
                                            pattern="\(\d{3}\) \d{3}-\d{4}"
                                            autoComplete="tel"
                                        />
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Address
                                        </span>
                                        <input
                                            className="border p-2 rounded"
                                            value={form.address || ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    address: e.target.value,
                                                })
                                            }
                                            placeholder="Address"
                                        />
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Blood Type
                                        </span>
                                        <select
                                            className="border p-2 rounded"
                                            value={form.blood_type || ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    blood_type: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">
                                                Select Blood Type
                                            </option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Allergies
                                        </span>
                                        <textarea
                                            className="border p-2 rounded"
                                            value={form.allergies || ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    allergies: e.target.value,
                                                })
                                            }
                                            placeholder="Allergies"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Emergency Contact
                                        </span>
                                        <input
                                            className="border p-2 rounded"
                                            value={form.emergency_contact || ""}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    emergency_contact:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Emergency contact"
                                        />
                                    </label>
                                    {/* Find a way to have physician lookup/autofill */}
                                    <label className="flex flex-col">
                                        <span className="mb-1 font-medium">
                                            Primary Care Physician
                                        </span>
                                        <input
                                            className="border p-2 rounded"
                                            value={
                                                form.primary_care_physician ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    primary_care_physician:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Primary Care Physician"
                                        />
                                    </label>
                                </div>
                                <div className="mt-3 flex gap-3">
                                    <button
                                        className="btn-primary"
                                        disabled={saving}
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const res = await fetch(
                                                    `/api/patients/${id}`,
                                                    {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                        },
                                                        body: JSON.stringify(
                                                            form
                                                        ),
                                                    }
                                                );
                                                if (!res.ok) {
                                                    const data =
                                                        await res.json();
                                                    alert(
                                                        data.error ||
                                                            "Failed to save"
                                                    );
                                                    return;
                                                }
                                                const updated =
                                                    await res.json();
                                                setPatient(updated);
                                                setForm({
                                                    fname: updated.fname,
                                                    lname: updated.lname,
                                                    email: updated.email,
                                                    phone: updated.phone,
                                                    address: updated.address,
                                                    insurance_provider:
                                                        updated.insurance_provider,
                                                    policy_number:
                                                        updated.policy_number,
                                                    date_of_birth:
                                                        updated.date_of_birth,
                                                    gender: updated.gender,
                                                    blood_type:
                                                        updated.blood_type,
                                                    allergies:
                                                        updated.allergies,
                                                    primary_care_physician:
                                                        updated.primary_care_physician,
                                                    emergency_contact:
                                                        updated.emergency_contact,
                                                });
                                                setEditing(false);
                                            } catch (err) {
                                                console.error(err);
                                                alert("Server error");
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setEditing(false);
                                            // reset form to original patient values
                                            setForm({
                                                fname: patient.fname,
                                                lname: patient.lname,
                                                email: patient.email,
                                                phone: patient.phone,
                                                address: patient.address,
                                                insurance_provider:
                                                    patient.insurance_provider,
                                                policy_number:
                                                    patient.policy_number,
                                                date_of_birth:
                                                    patient.date_of_birth,
                                                gender: patient.gender,
                                                blood_type: patient.blood_type,
                                                allergies: patient.allergies,
                                                primary_care_physician:
                                                    patient.primary_care_physician,
                                                emergency_contact:
                                                    patient.emergency_contact,
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
