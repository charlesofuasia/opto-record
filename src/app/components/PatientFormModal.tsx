"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import toast from "react-hot-toast";

interface Props {
    closeModal: () => void;
    onSuccess?: () => void;
}

export default function PatientFormModal({ closeModal, onSuccess }: Props) {
    const [physicians, setPhysicians] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        // User fields
        fname: "",
        lname: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        address: "",
        insurance_provider: "",
        policy_number: "",
        // Medical history fields
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
                toast.success("Patient created successfully!");
                if (onSuccess) {
                    onSuccess(); // Call the callback to refetch patients
                }
                closeModal();
                router.refresh(); // Refresh the page to show new patient
            } else {
                const data = await res.json();
                toast.error(data.error || "Error creating patient");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Server error");
        }
    };

    useEffect(() => {
        const fetchPhysicians = async () => {
            try {
                const res = await fetch("/api/users/physicians");
                const data: User[] = await res.json();
                setPhysicians(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPhysicians();
    }, []);

    return (
        <div className="fixed inset-0 bg-background/75 flex items-center justify-center z-50">
            <div className="w-full max-w-3xl mx-auto p-6 rounded-2xl mt-10 bg-primary overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Add New Patient
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* User Information Section */}
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold mb-3">User Information</h3>

                        {/* First Name */}
                        <div className="mb-4">
                            <label htmlFor="fname" className="block font-medium mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="fname"
                                name="fname"
                                type="text"
                                required
                                placeholder="Enter first name"
                                value={formData.fname}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="mb-4">
                            <label htmlFor="lname" className="block font-medium mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lname"
                                name="lname"
                                type="text"
                                required
                                placeholder="Enter last name"
                                value={formData.lname}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block font-medium mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Username */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block font-medium mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block font-medium mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Leave blank for default password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                            <p className="text-sm mt-1">
                                If left blank, the default password &quot;password&quot; will be used.
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="mb-4">
                            <label htmlFor="phone" className="block font-medium mb-1">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Address */}
                        <div className="mb-4">
                            <label htmlFor="address" className="block font-medium mb-1">
                                Address
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Enter address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Insurance Provider */}
                        <div className="mb-4">
                            <label htmlFor="insurance_provider" className="block font-medium mb-1">
                                Insurance Provider
                            </label>
                            <input
                                id="insurance_provider"
                                name="insurance_provider"
                                type="text"
                                placeholder="Enter insurance provider"
                                value={formData.insurance_provider}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>

                        {/* Policy Number */}
                        <div className="mb-4">
                            <label htmlFor="policy_number" className="block font-medium mb-1">
                                Policy Number
                            </label>
                            <input
                                id="policy_number"
                                name="policy_number"
                                type="text"
                                placeholder="Enter policy number"
                                value={formData.policy_number}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            />
                        </div>
                    </div>

                    {/* Medical Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Medical Information</h3>

                        {/* Date of Birth */}
                        <div className="mb-4">
                            <label htmlFor="date_of_birth" className="block font-medium mb-1">
                                Date of Birth <span className="text-red-500">*</span>
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

                        {/* Gender */}
                        <div className="mb-4">
                            <label htmlFor="gender" className="block font-medium mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            >
                                <option value="" disabled>Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Height (inches) */}
                        <div className="mb-4">
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
                        <div className="mb-4">
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

                        {/* Primary Care Physician */}
                        <div className="mb-4">
                            <label
                                htmlFor="primary_care_physician"
                                className="block font-medium mb-1"
                            >
                                Primary Care Physician
                            </label>
                            <select
                                id="primary_care_physician"
                                name="primary_care_physician"
                                value={formData.primary_care_physician}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg focus:ring focus:ring-indigo-300"
                            >
                                <option value="" disabled>Select physician</option>
                                {physicians?.map((physician) => (
                                    <option key={physician.id} value={`${physician.fname} ${physician.lname}`}>
                                        {physician.fname} {physician.lname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Emergency Contact */}
                        <div className="mb-4">
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
                        <div className="mb-4">
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
                                <option value="" disabled>Select blood type</option>
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
                        <div className="mb-4">
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
                        <div className="mb-4">
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
                        <div className="mb-4">
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
                            Create Patient
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
