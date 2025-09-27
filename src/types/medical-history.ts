export type Gender = "Male" | "Female" | "Other" | string;
export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | string;
export type Status = "active" | "inactive" | "archived" | string;

export interface MedicalHistory {
  id: string;
  user_id: string;
  date_of_birth: Date;
  height_in?: number | null;
  weight_lbs?: number | null;
  gender?: Gender | null;
  primary_care_physician?: string | null;
  emergency_contact?: string | null;
  blood_type?: BloodType | null;
  allergies?: string | null;
  history?: string | null;
  last_visit?: Date | null;
  status?: Status;
}
