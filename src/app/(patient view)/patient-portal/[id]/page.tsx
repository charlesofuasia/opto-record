"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function PatientPortalPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patient-portal/${id}`);
        const data = await res.json();
        setPatient(data);
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
    (new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  return (
    <section className="p-4">
      <div className="card p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {patient.fname} {patient.lname}</h1>
        <div className="flex items-center gap-4 text-md text-text-secondary">
          <span>Age: {age}</span>
          <Dot className="inline h-4 w-4 mr-1" />
          <span>Patient ID: {patient.id}</span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>First Name:</strong> {patient.fname}</p>
            <p><strong>Last Name:</strong> {patient.lname}</p>
            <p><strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Address:</strong> {patient.address || "N/A"}</p>
          </div>
          <div>
            <p><strong>Blood Type:</strong> {patient.blood_type}</p>
            <p><strong>Allergies:</strong> {patient.allergies}</p>
            <p><strong>Emergency Contact:</strong> {patient.emergency_contact}</p>
            <p><strong>Insurance Provider:</strong> {patient.insurance_provider || "N/A"}</p>
            <p><strong>Policy Number:</strong> {patient.policy_number || "N/A"}</p>
            <p><strong>Primary Physician:</strong> {patient.primary_care_physician}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="btn-secondary">
            <Calendar className="inline h-4 w-4 mr-1" /> Schedule Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
