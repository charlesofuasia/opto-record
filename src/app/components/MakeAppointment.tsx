"use client";
import React, { useEffect, useState } from "react";

type Physician = {
    id: string;
    fname: string;
    lname: string;
    email?: string;
};

export default function MakeAppointment() {
    const [physicians, setPhysicians] = useState<Physician[]>([]);
    const [physicianId, setPhysicianId] = useState<string>("");
    const [appointmentDate, setAppointmentDate] = useState<string>("");
    const [appointmentTime, setAppointmentTime] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadPhysicians() {
            try {
                const res = await fetch("/api/users/physicians");
                if (!res.ok) return;
                const data = await res.json();
                setPhysicians(data);
                if (data.length > 0) setPhysicianId(data[0].id);
            } catch (err) {
                console.error(err);
            }
        }

        loadPhysicians();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!appointmentDate || !appointmentTime) {
                alert("Please provide date and time for the appointment");
                setLoading(false);
                return;
            }

            // Combine date and time into an ISO string
            const appointmentDateTime = new Date(
                `${appointmentDate}T${appointmentTime}`
            );

            const body: {
                physician_id: string;
                appointment_date: string;
                reason?: string | null;
            } = {
                physician_id: physicianId,
                appointment_date: appointmentDateTime.toISOString(),
                reason: reason || null,
            };

            const res = await fetch("/api/appointments/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert("Appointment request submitted");
                // reset
                setReason("");
                setAppointmentDate("");
                setAppointmentTime("");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit request");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
                Request an Appointment
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="physician"
                        className="block text-sm font-medium"
                    >
                        Physician
                    </label>
                    <select
                        id="physician"
                        value={physicianId}
                        onChange={(e) => setPhysicianId(e.target.value)}
                        className="w-full border p-2 rounded-lg"
                    >
                        {physicians.length === 0 && <option>Loading...</option>}
                        {physicians.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.fname} {p.lname}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label
                            htmlFor="date"
                            className="block text-sm font-medium"
                        >
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="w-full border p-2 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="time"
                            className="block text-sm font-medium"
                        >
                            Time
                        </label>
                        <input
                            id="time"
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="w-full border p-2 rounded-lg"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="reason"
                        className="block text-sm font-medium"
                    >
                        Reason (optional)
                    </label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border p-2 rounded-lg"
                        rows={3}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Request Appointment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
