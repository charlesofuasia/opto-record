import { UserTypesEnum } from "@/constants/roles.enum";
import { CreateAppointmentDto } from "@/dto/appointment.dto";
import { AppointmentWithPatientUser } from "@/types/appointment";
import { User } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

interface Props {
    selectedAppointment: AppointmentWithPatientUser | null;
    formData: CreateAppointmentDto;
    authenticatedUser: User | null;
    isLoadingAuth: boolean;
    closeModal: () => void;
    fetchAppointments: () => void;
    resetForm: (data: CreateAppointmentDto) => void;
}

export default function AppointmentFormModal({
    selectedAppointment,
    formData,
    authenticatedUser,
    isLoadingAuth,
    closeModal,
    fetchAppointments,
    resetForm,
}: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const patients = users?.filter(u => u.type === "Patient");
    const physicians = users?.filter(u => u.type === "Physician");
    const isPhysician = authenticatedUser?.type === UserTypesEnum.Physician;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = selectedAppointment
            ? `/api/appointments/${selectedAppointment.id}`
            : "/api/appointments";
        const method = selectedAppointment ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                closeModal();
                fetchAppointments();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || "Failed to save appointment"}`);
            }
        } catch (error) {
            console.error("Error saving appointment:", error);
            alert("Failed to save appointment");
        }
    };

    const fetchUsers = useCallback(async () => {
        if (!authenticatedUser) return;

        try {
            const response = await fetch("/api/users");
            const data: User[] = await response.json();

            if (data?.length) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, [authenticatedUser]);

    useEffect(() => {
        if (!isLoadingAuth && authenticatedUser) {
            fetchAppointments();
            fetchUsers();
        }
    }, [isLoadingAuth, authenticatedUser, fetchAppointments, fetchUsers]);

    return (
        <div className="fixed inset-0 bg-background/75 flex items-center justify-center z-50">
            <div className="bg-primary rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                    {selectedAppointment
                        ? `Edit Appointment: ${selectedAppointment.id}`
                        : "New Appointment"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Patient *</label>
                        <select
                            value={formData.patient_id}
                            onChange={e =>
                                resetForm({ ...formData, patient_id: e.target.value })
                            }
                            disabled={authenticatedUser?.type === "Patient"}
                            required
                            className="input"
                        >
                            <option value="">Select Patient</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.fname} {patient.lname} ({patient.username})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Physician Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Physician *
                        </label>
                        <select
                            value={formData.physician_id}
                            onChange={e =>
                                resetForm({ ...formData, physician_id: e.target.value })
                            }
                            disabled={isPhysician}
                            required
                            className="input"
                        >
                            <option value="">Select Physician</option>
                            {isPhysician && authenticatedUser ? (
                                <option value={authenticatedUser.id}>
                                    {authenticatedUser.fname} {authenticatedUser.lname} (
                                    {authenticatedUser.username})
                                </option>
                            ) : (
                                physicians.map(physician => (
                                    <option key={physician.id} value={physician.id}>
                                        {physician.fname} {physician.lname} ({physician.username})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.appointment_date}
                            onChange={e =>
                                resetForm({
                                    ...formData,
                                    appointment_date: e.target.value,
                                })
                            }
                            required
                            className="input"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Reason</label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={e => resetForm({ ...formData, reason: e.target.value })}
                            placeholder="e.g., Routine checkup"
                            className="input"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Status *</label>
                        <select
                            value={formData.status}
                            onChange={e => resetForm({ ...formData, status: e.target.value })}
                            required
                            className="input"
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-Show">No-Show</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => resetForm({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Additional notes..."
                            className="input"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => closeModal()}
                            className="btn-secondary-outline"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-background">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
