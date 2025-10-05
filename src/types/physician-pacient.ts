export interface PhysicianPatient {
    id: string;
    physician_id: string;
    patient_id: string;
    assigned_date?: string;
    is_active?: boolean;
    notes?: string;
}
