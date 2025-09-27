import pool from "../lib/db";
import { AuthenticatedUser } from "../lib/auth";
import { MedicalHistory } from "../types/medical-history";

/**
 * Service layer for medical-history-related database operations
 */

export interface MedicalHistoryWithUserDetails extends MedicalHistory {
    fname?: string;
    lname?: string;
    email?: string;
    patient_type?: string;
}

interface PatientWithoutHistory {
    id: string;
    fname: string;
    lname: string;
    email: string;
}

export class MedicalHistoryService {
    /**
     * Get medical histories based on user role and permissions
     */
    static async getMedicalHistoriesByRole(user: AuthenticatedUser): Promise<MedicalHistoryWithUserDetails[]> {
        switch (user.type) {
            case 'Admin':
                return await this.getAllMedicalHistories();
            case 'Patient':
                return await this.getPatientMedicalHistory(user.id);
            case 'Physician':
                // TODO: Implement when physician-patient relationship exists
                return await this.getPhysicianPatientsMedicalHistories(user.id);
            default:
                return [];
        }
    }

    /**
     * Get all medical histories (for admin users)
     */
    static async getAllMedicalHistories(): Promise<MedicalHistoryWithUserDetails[]> {
        const result = await pool.query(
            `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
              mh.gender, mh.primary_care_physician, mh.emergency_contact, 
              mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
              u.fname, u.lname, u.email, u.type as patient_type
       FROM medical_history mh 
       LEFT JOIN users u ON mh.user_id = u.id
       ORDER BY mh.last_visit DESC, u.lname, u.fname`
        );
        return result.rows;
    }

    /**
     * Get medical history for a specific patient
     */
    static async getPatientMedicalHistory(patientId: string): Promise<MedicalHistoryWithUserDetails[]> {
        const result = await pool.query(
            `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
              mh.gender, mh.primary_care_physician, mh.emergency_contact, 
              mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
       FROM medical_history mh 
       WHERE mh.user_id = $1`,
            [patientId]
        );
        return result.rows;
    }

    /**
     * Get medical histories for patients assigned to a specific physician
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getPhysicianPatientsMedicalHistories(_physicianId: string): Promise<MedicalHistoryWithUserDetails[]> {
        // TODO: Implement when physician-patient relationship table exists
        // For now, return empty array

        /* Future implementation might look like:
        const result = await pool.query(
          `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                  mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                  mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
                  u.fname, u.lname, u.email, u.type as patient_type
           FROM medical_history mh 
           LEFT JOIN users u ON mh.user_id = u.id
           INNER JOIN patient_physician pp ON mh.user_id = pp.patient_id
           WHERE pp.physician_id = $1 AND u.type = 'Patient'
           ORDER BY mh.last_visit DESC, u.lname, u.fname`,
          [_physicianId]
        );
        return result.rows;
        */

        return [];
    }

    /**
     * Get a single medical history by ID with user details
     */
    static async getMedicalHistoryById(medicalHistoryId: string): Promise<MedicalHistoryWithUserDetails | null> {
        const result = await pool.query(
            `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
              mh.gender, mh.primary_care_physician, mh.emergency_contact, 
              mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
              u.fname, u.lname, u.email, u.type as patient_type
       FROM medical_history mh 
       LEFT JOIN users u ON mh.user_id = u.id
       WHERE mh.id = $1`,
            [medicalHistoryId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Get medical history by user ID
     */
    static async getMedicalHistoryByUserId(userId: string): Promise<MedicalHistoryWithUserDetails | null> {
        const result = await pool.query(
            `SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
              mh.gender, mh.primary_care_physician, mh.emergency_contact, 
              mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
              u.fname, u.lname, u.email, u.type as patient_type
       FROM medical_history mh 
       LEFT JOIN users u ON mh.user_id = u.id
       WHERE mh.user_id = $1`,
            [userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Check if a user can access a specific medical history
     */
    static canAccessMedicalHistory(user: AuthenticatedUser, medicalHistory: MedicalHistory): boolean {
        if (user.type === 'Admin') {
            return true;
        } else if (user.type === 'Patient' && medicalHistory.user_id === user.id) {
            return true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to access
            return true;
        }
        return false;
    }

    /**
     * Check if a user can update a specific medical history
     */
    static canUpdateMedicalHistory(user: AuthenticatedUser, medicalHistory: MedicalHistory): boolean {
        if (user.type === 'Admin') {
            return true;
        } else if (user.type === 'Physician') {
            // TODO: Check if physician is assigned to this patient
            // For now, allow all physicians to update
            return true;
        } else if (user.type === 'Patient' && medicalHistory.user_id === user.id) {
            return true;
        }
        return false;
    }

    /**
     * Check if a user can delete a specific medical history
     */
    static canDeleteMedicalHistory(user: AuthenticatedUser): boolean {
        // Only admins can delete medical histories (sensitive data)
        return user.type === 'Admin';
    }

    /**
     * Get patients without medical history (for admin/physician use)
     */
    static async getPatientsWithoutMedicalHistory(): Promise<PatientWithoutHistory[]> {
        const result = await pool.query(
            `SELECT u.id, u.fname, u.lname, u.email
       FROM users u
       LEFT JOIN medical_history mh ON u.id = mh.user_id
       WHERE u.type = 'Patient' AND mh.id IS NULL
       ORDER BY u.lname, u.fname`
        );
        return result.rows;
    }

    /**
     * Get medical history statistics (for admin dashboard)
     */
    static async getMedicalHistoryStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        patientsWithHistory: number;
        patientsWithoutHistory: number;
    }> {
        const statsResult = await pool.query(
            `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
         COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
       FROM medical_history`
        );

        const patientsResult = await pool.query(
            `SELECT 
         COUNT(CASE WHEN mh.id IS NOT NULL THEN 1 END) as with_history,
         COUNT(CASE WHEN mh.id IS NULL THEN 1 END) as without_history
       FROM users u
       LEFT JOIN medical_history mh ON u.id = mh.user_id
       WHERE u.type = 'Patient'`
        );

        const stats = statsResult.rows[0];
        const patients = patientsResult.rows[0];

        return {
            total: parseInt(stats.total) || 0,
            active: parseInt(stats.active) || 0,
            inactive: parseInt(stats.inactive) || 0,
            patientsWithHistory: parseInt(patients.with_history) || 0,
            patientsWithoutHistory: parseInt(patients.without_history) || 0,
        };
    }

    /**
     * Search medical histories by patient name or medical conditions
     */
    static async searchMedicalHistories(
        searchTerm: string,
        user: AuthenticatedUser
    ): Promise<MedicalHistoryWithUserDetails[]> {
        if (user.type !== 'Admin' && user.type !== 'Physician') {
            return [];
        }

        const searchPattern = `%${searchTerm.toLowerCase()}%`;

        let query = `
      SELECT mh.id, mh.user_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
             mh.gender, mh.primary_care_physician, mh.emergency_contact, 
             mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status,
             u.fname, u.lname, u.email, u.type as patient_type
      FROM medical_history mh 
      LEFT JOIN users u ON mh.user_id = u.id
      WHERE (LOWER(u.fname) LIKE $1 OR LOWER(u.lname) LIKE $1 
             OR LOWER(mh.allergies) LIKE $1 OR LOWER(mh.history) LIKE $1
             OR LOWER(mh.primary_care_physician) LIKE $1)
    `;

        const params = [searchPattern];

        // If physician, restrict to their patients (when relationship exists)
        if (user.type === 'Physician') {
            // TODO: Add physician-patient relationship restriction
            // query += ` AND EXISTS (SELECT 1 FROM patient_physician pp WHERE pp.patient_id = mh.user_id AND pp.physician_id = $2)`;
            // params.push(user.id);
        }

        query += ` ORDER BY mh.last_visit DESC, u.lname, u.fname`;

        const result = await pool.query(query, params);
        return result.rows;
    }
}