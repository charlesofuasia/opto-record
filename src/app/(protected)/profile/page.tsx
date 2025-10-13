"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Edit, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const { user } = useRequireAuth();
    const { fetchUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fname: user?.fname || "",
        lname: user?.lname || "",
        email: user?.email || "",
        username: user?.username || "",
        phone: user?.phone || "",
        address: user?.address || "",
        insurance_provider: user?.insurance_provider || "",
        policy_number: user?.policy_number || "",
        password: "",
    });

    // Update formData when user data loads
    useState(() => {
        if (user) {
            setFormData({
                fname: user.fname || "",
                lname: user.lname || "",
                email: user.email || "",
                username: user.username || "",
                phone: user.phone || "",
                address: user.address || "",
                insurance_provider: user.insurance_provider || "",
                policy_number: user.policy_number || "",
                password: "",
            });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        // Reset form to original user data
        setFormData({
            fname: user?.fname || "",
            lname: user?.lname || "",
            email: user?.email || "",
            username: user?.username || "",
            phone: user?.phone || "",
            address: user?.address || "",
            insurance_provider: user?.insurance_provider || "",
            policy_number: user?.policy_number || "",
            password: "",
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.fname || !formData.lname || !formData.email || !formData.username) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            // Prepare update data - only include fields that have values
            const updateData: Record<string, string> = {
                fname: formData.fname,
                lname: formData.lname,
                email: formData.email,
                username: formData.username,
            };

            // Add optional fields only if they have values
            if (formData.phone) updateData.phone = formData.phone;
            if (formData.address) updateData.address = formData.address;
            if (formData.insurance_provider) updateData.insurance_provider = formData.insurance_provider;
            if (formData.policy_number) updateData.policy_number = formData.policy_number;
            if (formData.password) updateData.password = formData.password;

            const response = await fetch(`/api/users/${user?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update profile");
            }

            // Refetch user data to update the auth store
            await fetchUser();

            // Update local form data with the newly fetched user data
            const freshUser = useAuthStore.getState().user;
            if (freshUser) {
                setFormData({
                    fname: freshUser.fname || "",
                    lname: freshUser.lname || "",
                    email: freshUser.email || "",
                    username: freshUser.username || "",
                    phone: freshUser.phone || "",
                    address: freshUser.address || "",
                    insurance_provider: freshUser.insurance_provider || "",
                    policy_number: freshUser.policy_number || "",
                    password: "",
                });
            }

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <section className="p-6">
                <div className="card p-6">
                    <p>Loading profile...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="p-6">
            <div className="card p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {user.fname} {user.lname}
                        </h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="px-3 py-1 bg-background rounded-full font-medium">
                                {user.type}
                            </span>
                            <span>ID: {user.id}</span>
                        </div>
                    </div>
                    <div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-background flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="btn-secondary-outline flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="btn-background flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4" />
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label htmlFor="fname" className="block text-sm font-medium mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="fname"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">{user.fname}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="lname" className="block text-sm font-medium mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="lname"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">{user.lname}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">{user.email}</p>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">{user.username}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Phone
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">
                                    {user.phone || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium mb-2">
                                Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">
                                    {user.address || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Insurance Provider */}
                        <div>
                            <label
                                htmlFor="insurance_provider"
                                className="block text-sm font-medium mb-2"
                            >
                                Insurance Provider
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="insurance_provider"
                                    name="insurance_provider"
                                    value={formData.insurance_provider}
                                    onChange={handleChange}
                                    placeholder="Enter insurance provider"
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">
                                    {user.insurance_provider || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Policy Number */}
                        <div>
                            <label htmlFor="policy_number" className="block text-sm font-medium mb-2">
                                Policy Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="policy_number"
                                    name="policy_number"
                                    value={formData.policy_number}
                                    onChange={handleChange}
                                    placeholder="Enter policy number"
                                    className="input"
                                />
                            ) : (
                                <p className="text-md p-2 bg-secondary rounded-lg">
                                    {user.policy_number || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Password - Only show in edit mode */}
                        {isEditing && (
                            <div className="md:col-span-2">
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current password"
                                    className="input"
                                />
                                <p className="text-sm mt-1">
                                    Leave blank if you don&apos;t want to change your password
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
