import React, { useEffect, useState } from "react";

type Appointment = {
    id: string;
    patient_id: string;
    physician_id: string;
    appointment_date: string;
    reason: string;
    status: string;
    notes?: string;
    physician_fname?: string;
    physician_lname?: string;
};

interface Props {
    appointments?: Appointment[];
    currentUserId: string;
    fetchUrl?: string;
}

export default function UpcomingAppointments({
    appointments = [],
    currentUserId,
    fetchUrl,
}: Props) {
    const [items, setItems] = useState<Appointment[]>(appointments);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!fetchUrl) return;
        setLoading(true);
        setError(null);
        fetch(fetchUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: Appointment[]) => {
                setItems(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Failed to load appointments:", err);
                setError("Failed to load appointments");
            })
            .finally(() => setLoading(false));
    }, [fetchUrl]);

    const now = new Date();
    const upcoming = items
        .filter((a) => a.patient_id === currentUserId)
        .filter((a) => {
            const d = new Date(a.appointment_date);
            return !isNaN(d.getTime()) && d >= now;
        })
        .sort(
            (a, b) =>
                new Date(a.appointment_date).getTime() -
                new Date(b.appointment_date).getTime()
        );

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleString() : "Unknown";

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">
                Upcoming Appointments
            </h2>

            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {!loading && upcoming.length === 0 && (
                <div className="text-sm ">No upcoming appointments.</div>
            )}

            <ul className="space-y-4">
                {upcoming.map((appt) => (
                    <li
                        key={appt.id}
                        className="p-3 border rounded hover:shadow-sm transition"
                    >
                        <div className="flex justify-end">
                            <button
                                className="text-sm text-red-600 hover:underline"
                                disabled={deletingId === appt.id}
                                onClick={async () => {
                                    if (!confirm("Cancel this appointment?"))
                                        return;
                                    try {
                                        setDeletingId(appt.id);
                                        const res = await fetch(
                                            `/api/appointments?id=${encodeURIComponent(
                                                appt.id
                                            )}`,
                                            { method: "DELETE" }
                                        );
                                        if (!res.ok) {
                                            const data = await res.json();
                                            alert(
                                                data.error ||
                                                    "Failed to cancel appointment"
                                            );
                                            return;
                                        }
                                        // Remove from local items
                                        setItems((prev) =>
                                            prev.filter((i) => i.id !== appt.id)
                                        );
                                    } catch (err) {
                                        console.error(err);
                                        alert("Server error");
                                    } finally {
                                        setDeletingId(null);
                                    }
                                }}
                            >
                                {deletingId === appt.id
                                    ? "Cancelling..."
                                    : "Cancel"}
                            </button>
                        </div>
                        <div>Status: {appt.status}</div>
                        <div>
                            Physician: Dr.{appt.physician_fname}{" "}
                            {appt.physician_lname}
                        </div>
                        <div className="font-medium">{appt.reason}</div>
                        <div className="text-sm ">
                            {formatDate(appt.appointment_date)}
                        </div>
                        {appt.notes && (
                            <div className="text-sm  mt-1">
                                Notes: {appt.notes}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
