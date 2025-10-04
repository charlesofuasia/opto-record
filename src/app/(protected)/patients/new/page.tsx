"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    height_in: "",
    weight_lbs: "",
    blood_type: "",
    allergies: "",
    medical_history: "",
    last_visit: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create patient");

      alert("✅ Patient added successfully!");
      router.push("/patients");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Patient</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="first_name"
          placeholder="First Name"
          onChange={handleChange}
          value={formData.first_name}
          className="border rounded p-2"
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          onChange={handleChange}
          value={formData.last_name}
          className="border rounded p-2"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          value={formData.email}
          className="border rounded p-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          value={formData.phone}
          className="border rounded p-2"
        />
        <input
          type="date"
          name="date_of_birth"
          placeholder="Date of Birth"
          onChange={handleChange}
          value={formData.date_of_birth}
          className="border rounded p-2"
        />
        <select
          name="gender"
          onChange={handleChange}
          value={formData.gender}
          className="border rounded p-2"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
          value={formData.address}
          className="border rounded p-2 col-span-2"
        />
        <input
          name="height_in"
          placeholder="Height (in)"
          type="number"
          onChange={handleChange}
          value={formData.height_in}
          className="border rounded p-2"
        />
        <input
          name="weight_lbs"
          placeholder="Weight (lbs)"
          type="number"
          onChange={handleChange}
          value={formData.weight_lbs}
          className="border rounded p-2"
        />
        <input
          name="blood_type"
          placeholder="Blood Type"
          onChange={handleChange}
          value={formData.blood_type}
          className="border rounded p-2"
        />
        <textarea
          name="allergies"
          placeholder="Allergies"
          onChange={handleChange}
          value={formData.allergies}
          className="border rounded p-2 col-span-2"
        />
        <textarea
          name="medical_history"
          placeholder="Medical History"
          onChange={handleChange}
          value={formData.medical_history}
          className="border rounded p-2 col-span-2"
        />
        <input
          type="date"
          name="last_visit"
          placeholder="Last Visit"
          onChange={handleChange}
          value={formData.last_visit}
          className="border rounded p-2"
        />
        <select
          name="status"
          onChange={handleChange}
          value={formData.status}
          className="border rounded p-2"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
