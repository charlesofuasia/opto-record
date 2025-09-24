"use client";

import { Calendar, Dot, Edit, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function PatientsPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${id}`);
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

  if (loading) return <p>Loading patient info...</p>;
  if (!patient) return <p>Patient not found.</p>;

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.date_of_birth).getTime()) /
      (1000 * 60 * 60 * 24 * 365)
  );

  return (
    <section>
      <div className="card flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl mb-2">{patient.fname} {patient.lname}</h1>
          <div className="flex items-center gap-4 text-md text-text-secondary">
            <span>Age: {age}</span>
            <Dot className="inline h-4 w-4 mr-1" />
            <span>Patient ID: #{patient.id}</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button className="btn-secondary">
            <Edit className="inline h-4 w-4 mr-1" /> Edit Info
          </button>
          <button className="btn-secondary">
            <Plus className="inline h-4 w-4 mr-1" /> Add Record
          </button>
          <button className="btn-secondary">
            <Calendar className="inline h-4 w-4 mr-1" /> Schedule Appointment
          </button>
        </div>
      </div>

      <div className="card">
        <ul className="flex gap-8 text-text-secondary border-b pb-2 mb-4">
          <li>Profile</li>
          <li>List</li>
          <li>Appointments</li>
        </ul>

        <div id="profile">
          <form className="flex gap-8 w-full">
            <div className="flex flex-col gap-4 w-full">
              <h2 className="mb-4">Personal Information</h2>
              <label>
                <span className="text-sm">Full Name</span>
                <input className="input" type="text" disabled value={patient.fname} />
              </label>
              <label>
                <span className="text-sm">Last Name</span>
                <input className="input" type="text" disabled value={patient.lname} />
              </label>
              <label>
                <span className="text-sm">Date of Birth</span>
                <input className="input" type="text" disabled value={new Date(patient.date_of_birth).toLocaleDateString()} />
              </label>
              <label>
                <span className="text-sm">Gender</span>
                <input className="input" type="text" disabled value={patient.gender} />
              </label>
              <label>
                <span className="text-sm">Phone Number</span>
                <input className="input" type="text" disabled value={patient.phone} />
              </label>
              <label>
                <span className="text-sm">Email Address</span>
                <input className="input" type="text" disabled value={patient.email} />
              </label>
              <label>
                <span className="text-sm">Address</span>
                <textarea className="input" disabled value={patient.address || ""} />
              </label>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <h2 className="mb-4">Medical Information</h2>
              <label>
                <span className="text-sm">Blood Type</span>
                <input className="input" type="text" disabled value={patient.blood_type} />
              </label>
              <label>
                <span className="text-sm">Allergies</span>
                <input className="input" type="text" disabled value={patient.allergies} />
              </label>
              <label>
                <span className="text-sm">Emergency Contact</span>
                <textarea className="input" disabled value={patient.emergency_contact} />
              </label>
              <label>
                <span className="text-sm">Insurance Provider</span>
                <input className="input" type="text" disabled value={patient.insurance_provider || ""} />
              </label>
              <label>
                <span className="text-sm">Policy Number</span>
                <input className="input" type="text" disabled value={patient.policy_number || ""} />
              </label>
              <label>
                <span className="text-sm">Primary Physician</span>
                <input className="input" type="text" disabled value={patient.primary_care_physician} />
              </label>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
