"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    closeModal: () => void;
}

export default function PatientFormModal({ closeModal }: Props) {
    const [formData, setFormData] = useState({
        date_of_birth: "",
        height_in: "",
        weight_lbs: "",
        gender: "",
        primary_care_physician: "",
        emergency_contact: "",
        blood_type: "",
        allergies: "",
        history: "",
        status: "active",
    });

    const router = useRouter();

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Patient record added successfully!");
                router.push("/patients");
            } else {
                const data = await res.json();
                alert(data.message || "Error adding patient record");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error");
        }
    };

    return (
        <div className="fixed inset-0 bg-background/75 flex items-center justify-center z-50">
            <div className="w-full max-w-3xl mx-auto p-6 rounded-2xl mt-10 bg-primary overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Add New Patient Record
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date of Birth */}
                    <div>
                        <label htmlFor="date_of_birth" className="block font-medium mb-1">
                            Date of Birth
                        </label>
                        <input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            required
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Height (inches) */}
                    <div>
                        <label htmlFor="height_in" className="block font-medium mb-1">
                            Height (inches)
                        </label>
                        <input
                            id="height_in"
                            name="height_in"
                            type="number"
                            placeholder="Enter height in inches"
                            value={formData.height_in}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Weight (lbs) */}
                    <div>
                        <label htmlFor="weight_lbs" className="block font-medium mb-1">
                            Weight (lbs)
                        </label>
                        <input
                            id="weight_lbs"
                            name="weight_lbs"
                            type="number"
                            placeholder="Enter weight in lbs"
                            value={formData.weight_lbs}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block font-medium mb-1">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Primary Care Physician */}
                    <div>
                        <label
                            htmlFor="primary_care_physician"
                            className="block font-medium mb-1"
                        >
                            Primary Care Physician
                        </label>
                        <input
                            id="primary_care_physician"
                            name="primary_care_physician"
                            type="text"
                            placeholder="Enter physician's name"
                            value={formData.primary_care_physician}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label
                            htmlFor="emergency_contact"
                            className="block font-medium mb-1"
                        >
                            Emergency Contact
                        </label>
                        <input
                            id="emergency_contact"
                            name="emergency_contact"
                            type="text"
                            placeholder="Enter emergency contact name and number"
                            value={formData.emergency_contact}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label htmlFor="blood_type" className="block font-medium mb-1">
                            Blood Type
                        </label>
                        <select
                            id="blood_type"
                            name="blood_type"
                            value={formData.blood_type}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        >
                            <option value="">Select blood type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    {/* Allergies */}
                    <div>
                        <label htmlFor="allergies" className="block font-medium mb-1">
                            Allergies
                        </label>
                        <textarea
                            id="allergies"
                            name="allergies"
                            rows={2}
                            placeholder="Enter allergies (if any)"
                            value={formData.allergies}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Medical History */}
                    <div>
                        <label htmlFor="history" className="block font-medium mb-1">
                            Medical History
                        </label>
                        <textarea
                            id="history"
                            name="history"
                            rows={3}
                            placeholder="Enter relevant medical history"
                            value={formData.history}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block font-medium mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => closeModal()}
                            className="btn-secondary-outline"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-background">
                            Save Patient Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
