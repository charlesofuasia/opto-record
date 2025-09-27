import type { Appointment } from "../types/appointment";

export type CreateAppointmentDto = Omit<Appointment, "id">;

export type UpdateAppointmentDto = Partial<Omit<Appointment, "id" | "patient_id" | "physician_id">>;
