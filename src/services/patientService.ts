import pool from "../lib/db";
import { PatientResponse } from "../dto/patient.dto";

export class PatientService {
    // Get all patients with filtering options
    static async getPatients(filters: {
        search?: string;
        status?: string;
        physician?: string;
        limit?: number;
        offset?: number;
    } = {}) {
        let query = `
            SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
                   u.insurance_provider, u.policy_number,
                   mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                   mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                   mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
            FROM users u
            LEFT JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.type = 'Patient'
        `;

        const queryParams: (string | number | Date | null)[] = [];
        let paramCount = 1;

        // Add search filter
        if (filters.search) {
            query += ` AND (u.fname ILIKE $${paramCount} OR u.lname ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            queryParams.push(`%${filters.search}%`);
            paramCount++;
        }

        // Add status filter
        if (filters.status) {
            query += ` AND mh.status = $${paramCount}`;
            queryParams.push(filters.status);
            paramCount++;
        }

        // Add physician filter
        if (filters.physician) {
            query += ` AND mh.primary_care_physician = $${paramCount}`;
            queryParams.push(filters.physician);
            paramCount++;
        }

        // Add ordering
        query += ` ORDER BY u.lname, u.fname`;

        // Add pagination
        if (filters.limit) {
            query += ` LIMIT $${paramCount}`;
            queryParams.push(filters.limit);
            paramCount++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramCount}`;
            queryParams.push(filters.offset);
            paramCount++;
        }

        const result = await pool.query(query, queryParams);

        return result.rows.map((row: Record<string, unknown>) => ({
            ...row,
            age: row.date_of_birth ? Math.floor(
                (new Date().getTime() - new Date(row.date_of_birth as string).getTime()) /
                (1000 * 60 * 60 * 24 * 365)
            ) : undefined
        }));
    }

    // Get patient by ID with full details
    static async getPatientById(id: string): Promise<PatientResponse | null> {
        const result = await pool.query(`
            SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
                   u.insurance_provider, u.policy_number,
                   mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                   mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                   mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
            FROM users u
            LEFT JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.id = $1 AND u.type = 'Patient'
        `, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const patient = result.rows[0];
        return {
            ...patient,
            age: patient.date_of_birth ? Math.floor(
                (new Date().getTime() - new Date(patient.date_of_birth).getTime()) /
                (1000 * 60 * 60 * 24 * 365)
            ) : undefined
        };
    }

    // Get patients assigned to a specific physician
    static async getPatientsByPhysician(physicianId: string) {
        const result = await pool.query(`
            SELECT u.id, u.fname, u.lname, u.email, u.phone, 
                   mh.date_of_birth, mh.status, mh.last_visit
            FROM users u
            LEFT JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.type = 'Patient' AND mh.primary_care_physician = $1
            ORDER BY u.lname, u.fname
        `, [physicianId]);

        return result.rows.map((row: Record<string, unknown>) => ({
            ...row,
            age: row.date_of_birth ? Math.floor(
                (new Date().getTime() - new Date(row.date_of_birth as string).getTime()) /
                (1000 * 60 * 60 * 24 * 365)
            ) : undefined
        }));
    }

    // Get patient statistics
    static async getPatientStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_patients,
                COUNT(CASE WHEN mh.status = 'Active' THEN 1 END) as active_patients,
                COUNT(CASE WHEN mh.status = 'Inactive' THEN 1 END) as inactive_patients,
                COUNT(CASE WHEN mh.date_of_birth IS NOT NULL 
                    AND EXTRACT(YEAR FROM AGE(mh.date_of_birth)) < 18 THEN 1 END) as pediatric_patients,
                COUNT(CASE WHEN mh.date_of_birth IS NOT NULL 
                    AND EXTRACT(YEAR FROM AGE(mh.date_of_birth)) >= 65 THEN 1 END) as senior_patients,
                AVG(CASE WHEN mh.date_of_birth IS NOT NULL 
                    THEN EXTRACT(YEAR FROM AGE(mh.date_of_birth)) END) as avg_age
            FROM users u
            LEFT JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.type = 'Patient'
        `);

        return result.rows[0];
    }

    // Search patients by various criteria
    static async searchPatients(searchTerm: string, limit: number = 20) {
        const result = await pool.query(`
            SELECT u.id, u.fname, u.lname, u.email, u.phone,
                   mh.date_of_birth, mh.status, mh.primary_care_physician
            FROM users u
            LEFT JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.type = 'Patient' 
            AND (
                u.fname ILIKE $1 OR 
                u.lname ILIKE $1 OR 
                u.email ILIKE $1 OR 
                u.phone ILIKE $1 OR
                CONCAT(u.fname, ' ', u.lname) ILIKE $1
            )
            ORDER BY u.lname, u.fname
            LIMIT $2
        `, [`%${searchTerm}%`, limit]);

        return result.rows.map((row: Record<string, unknown>) => ({
            ...row,
            age: row.date_of_birth ? Math.floor(
                (new Date().getTime() - new Date(row.date_of_birth as string).getTime()) /
                (1000 * 60 * 60 * 24 * 365)
            ) : undefined
        }));
    }

    // Check if a patient exists and belongs to a physician (for access control)
    static async validatePatientPhysicianRelationship(patientId: string, physicianId: string): Promise<boolean> {
        const result = await pool.query(`
            SELECT 1 FROM users u
            JOIN medical_history mh ON u.id = mh.user_id
            WHERE u.id = $1 AND u.type = 'Patient' AND mh.primary_care_physician = $2
        `, [patientId, physicianId]);

        return result.rows.length > 0;
    }

    // Get recent patient activity (appointments, visits, etc.)
    static async getPatientActivity(patientId: string, limit: number = 10) {
        const result = await pool.query(`
            SELECT 'appointment' as activity_type, 
                   a.date_time as activity_date,
                   a.status as activity_status,
                   a.notes as activity_details,
                   phy.fname || ' ' || phy.lname as physician_name
            FROM appointments a
            JOIN users phy ON a.physician_id = phy.id
            WHERE a.patient_id = $1
            
            UNION ALL
            
            SELECT 'medical_history_update' as activity_type,
                   mh.last_visit as activity_date,
                   mh.status as activity_status,
                   'Medical history updated' as activity_details,
                   mh.primary_care_physician as physician_name
            FROM medical_history mh
            WHERE mh.user_id = $1 AND mh.last_visit IS NOT NULL
            
            ORDER BY activity_date DESC
            LIMIT $2
        `, [patientId, limit]);

        return result.rows;
    }
}