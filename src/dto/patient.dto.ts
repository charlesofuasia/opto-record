import { User } from "../types/user";

// Combined patient data (User + Medical History)
export interface PatientData extends Omit<User, 'id' | 'type'> {
    // Medical History fields
    date_of_birth: Date | string;
    height_in?: number | null;
    weight_lbs?: number | null;
    gender?: string | null;
    primary_care_physician?: string | null;
    emergency_contact?: string | null;
    blood_type?: string | null;
    allergies?: string | null;
    history?: string | null;
    last_visit?: Date | string | null;
    status?: string;
}

// For creating a new patient (combines user creation + medical history)
export type CreatePatientDto = PatientData;

// For updating patient (partial updates allowed)
export type UpdatePatientDto = Partial<Omit<PatientData, 'username' | 'email'>>;

// Response format for patient data
export interface PatientResponse {
    id: string;
    fname: string;
    lname: string;
    email: string;
    username: string;
    phone?: string | null;
    address?: string | null;
    insurance_provider?: string | null;
    policy_number?: string | null;
    // Medical History
    date_of_birth: Date | string;
    height_in?: number | null;
    weight_lbs?: number | null;
    gender?: string | null;
    primary_care_physician?: string | null;
    emergency_contact?: string | null;
    blood_type?: string | null;
    allergies?: string | null;
    history?: string | null;
    last_visit?: Date | string | null;
    status?: string;
    // Computed fields
    age?: number;
    medical_history_id?: string;
}