import { User } from "./user";

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;            // ISO date string
  reason?: string;
  status?: string;
  notes?: string;
  physician_id: string;
}

export type AppointmentWithPatientUser = Appointment & User;