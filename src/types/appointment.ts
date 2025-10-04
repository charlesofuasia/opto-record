export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;                // optional, for display
  primary_care_physician: string;      // VARCHAR(150)
  appointment_date: string;            // ISO date string
  time: "9-10" | "10-11" | "1-2" | "2-3" | "3-4"; // allowed slots
  reason?: string;
  status?: string;
  notes?: string;
}
