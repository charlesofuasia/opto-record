import type { Appointment } from "../types/appointment";

export type CreateAppointmentDto = Omit<Appointment, "id" | "patient_name">;

export type UpdateAppointmentDto = Partial<Omit<Appointment, "id" | "patient_id" | "patient_name">>;
