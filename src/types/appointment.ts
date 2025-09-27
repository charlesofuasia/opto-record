export interface Appointment {
  id: string;
  patient_id: string;
  physician_id: string;
  appointment_date: string;
  reason?: string;
  status?: string;
  notes?: string;
}
