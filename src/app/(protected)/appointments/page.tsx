"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useAuthStore } from "@/store/authStore";
import { PhysicianPatient } from "@/types/physician-pacient";
import AppointmentFormModal from "@/app/components/AppointmentFormModal";
import { AppointmentWithPatientUser } from "@/types/appointment";
import { CreateAppointmentDto } from "@/dto/appointment.dto";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: AppointmentWithPatientUser;
}

export default function AppointmentsPage() {
    const { user, isLoading } = useAuthStore();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentWithPatientUser | null>(null);
    const [draggedEvent, setDraggedEvent] = useState<{
        event: CalendarEvent;
        start: Date;
        end: Date;
    } | null>(null);

    const [formData, setFormData] = useState<CreateAppointmentDto>({
        patient_id: "",
        physician_id: "",
        appointment_date: "",
        reason: "",
        status: "Scheduled",
        notes: "",
    });

    // Fetch appointments based on user role
    const fetchAppointments = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch("/api/appointments");
            const data: AppointmentWithPatientUser[] = await response.json();

            if (data?.length) {
                let filteredAppointments = data;

                // Role-based filtering
                if (user.type === "Patient") {
                    filteredAppointments = filteredAppointments.filter(
                        (apt: AppointmentWithPatientUser) => apt.patient_id === user.id
                    );
                } else if (user.type === "Physician") {
                    // Get physician's assigned patients
                    const patientsResponse = await fetch("/api/physician-patients");
                    const patientsData: { success: boolean; data: PhysicianPatient[] } =
                        await patientsResponse.json();

                    if (patientsData.success) {
                        const patientIds = patientsData.data.map(
                            (rel: PhysicianPatient) => rel.patient_id
                        );
                        filteredAppointments = filteredAppointments.filter(
                            (apt: AppointmentWithPatientUser) =>
                                patientIds.includes(apt.patient_id)
                        );
                    }
                }

                // Convert to calendar events
                const calendarEvents: CalendarEvent[] = filteredAppointments.map(
                    (apt: AppointmentWithPatientUser) => {
                        const startDate = new Date(apt.appointment_date);
                        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

                        return {
                            id: apt.id,
                            title: `${apt.fname || "Patient"} - ${apt.reason || "Appointment"
                                }`,
                            start: startDate,
                            end: endDate,
                            resource: apt,
                        };
                    }
                );

                setEvents(calendarEvents);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    }, [user]);

    const handleSelectSlot = ({ start }: { start: Date }) => {
        // Prevent selecting past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            alert("Cannot schedule appointments in the past");
            return;
        }

        setSelectedAppointment(null);
        setFormData({
            patient_id: user?.type === "Patient" ? user.id : "",
            physician_id: user?.type === "Physician" ? user.id : "",
            appointment_date: format(start, "yyyy-MM-dd'T'HH:mm"),
            reason: "",
            status: "Scheduled",
            notes: "",
        });
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedAppointment(event.resource);
        setFormData({
            patient_id: event.resource.patient_id,
            physician_id: event.resource.physician_id,
            appointment_date: format(
                new Date(event.resource.appointment_date),
                "yyyy-MM-dd'T'HH:mm"
            ),
            reason: event.resource?.reason || "",
            status: event.resource?.status || "",
            notes: event.resource?.notes || "",
        });
        setIsModalOpen(true);
    };

    const handleEventDrop = ({
        event,
        start,
        end,
    }: {
        event: CalendarEvent;
        start: Date;
        end: Date;
    }) => {
        setDraggedEvent({ event, start, end });
        setIsConfirmOpen(true);
    };

    const confirmDrop = async () => {
        if (!draggedEvent) return;

        try {
            // Format the date without timezone conversion
            // Use the format that matches our database expectation
            const formattedDate = format(draggedEvent.start, "yyyy-MM-dd'T'HH:mm:ss");

            const response = await fetch(
                `/api/appointments/${draggedEvent.event.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        appointment_date: formattedDate,
                    }),
                }
            );

            if (response.ok) {
                fetchAppointments();
            }
        } catch (error) {
            console.error("Error updating appointment:", error);
        }

        setIsConfirmOpen(false);
        setDraggedEvent(null);
    };

    const cancelDrop = () => {
        setIsConfirmOpen(false);
        setDraggedEvent(null);
        fetchAppointments(); // Refresh to reset the visual state
    };

    const resetForm = (data: CreateAppointmentDto) => {
        setFormData(data);
    };

    useEffect(() => {
        if (!isLoading && user) {
            fetchAppointments();
        }
    }, [isLoading, user, fetchAppointments]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Appointments</h1>
                    <p className="mt-1">Manage and schedule patient appointments</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedAppointment(null);
                        setFormData({
                            patient_id: user?.type === "Patient" ? user.id : "",
                            physician_id: user?.type === "Physician" ? user.id : "",
                            appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                            reason: "",
                            status: "Scheduled",
                            notes: "",
                        });
                        setIsModalOpen(true);
                    }}
                    className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-background rounded-lg hover:bg-secondary transition-colors"
                >
                    <span className="text-xl">+</span>
                    <span>New Appointment</span>
                </button>
            </div>

            {/* Calendar */}
            <div className="p-6">
                {/* @ts-expect-error - React Big Calendar DnD types are complex */}
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor={(event: CalendarEvent) => event.start}
                    endAccessor={(event: CalendarEvent) => event.end}
                    style={{ height: 700 }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.MONTH}
                />
            </div>

            {/* Appointment Modal */}
            {isModalOpen && (
                <AppointmentFormModal
                    selectedAppointment={selectedAppointment}
                    formData={formData}
                    authenticatedUser={user}
                    isLoadingAuth={isLoading}
                    closeModal={() => setIsModalOpen(false)}
                    fetchAppointments={fetchAppointments}
                    resetForm={resetForm}
                />
            )}

            {/* Confirmation Modal for Drag & Drop */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-background/75 flex items-center justify-center z-50">
                    <div className="bg-primary rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-boldmb-4">
                            Confirm Appointment Change
                        </h3>
                        <p className="mb-6">
                            Are you sure you want to reschedule this appointment to{" "}
                            {draggedEvent && format(draggedEvent.start, "PPpp")}?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={cancelDrop} className="btn-secondary-outline">
                                Cancel
                            </button>
                            <button onClick={confirmDrop} className="btn-background">
                                Yes, change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
