import pool from "../lib/db";
import { AuthenticatedUser } from "../lib/auth";
import { Appointment } from "../types/appointment";

/**
 * Service layer for appointment-related database operations
 */

export interface AppointmentWithUserDetails extends Appointment {
    patient_fname?: string;
    patient_lname?: string;
    patient_email?: string;
    physician_fname?: string;
    physician_lname?: string;
    physician_email?: string;
}

export class AppointmentService {
    /**
     * Get appointments based on user role and permissions
     */
    static async getAppointmentsByRole(
        user: AuthenticatedUser
    ): Promise<AppointmentWithUserDetails[]> {
        switch (user.type) {
            case "Admin":
                return await this.getAllAppointments();
            case "Patient":
                return await this.getPatientAppointments(user.id);
            case "Physician":
                return await this.getPhysicianAppointments(user.id);
            default:
                return [];
        }
    }

    /**
     * Create a new appointment (centralized logic)
     * Validates that patient and physician exist and have correct types.
     */
    static async createAppointment({
        patientId,
        physicianId,
        appointmentDate,
        reason,
        status = "Scheduled",
        notes = null,
    }: {
        patientId: string;
        physicianId: string;
        appointmentDate: string; // ISO string
        reason?: string | null;
        status?: string;
        notes?: string | null;
    }): Promise<AppointmentWithUserDetails> {
        // Validate patient exists and is a Patient
        const patientCheck = await pool.query(
            `SELECT id, type FROM users WHERE id = $1`,
            [patientId]
        );
        if (patientCheck.rows.length === 0) {
            throw new Error("Patient not found");
        }
        if (patientCheck.rows[0].type !== "Patient") {
            throw new Error("Specified user is not a patient");
        }

        // Validate physician exists and is a Physician
        const physicianCheck = await pool.query(
            `SELECT id, type FROM users WHERE id = $1`,
            [physicianId]
        );
        if (physicianCheck.rows.length === 0) {
            throw new Error("Physician not found");
        }
        if (physicianCheck.rows[0].type !== "Admin") {
            throw new Error("Specified user is not a physician");
        }

        const result = await pool.query(
            `INSERT INTO appointments (patient_id, physician_id, appointment_date, reason, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, patient_id, physician_id, appointment_date, reason, status, notes`,
            [
                patientId,
                physicianId,
                appointmentDate,
                reason || null,
                status || "Scheduled",
                notes || null,
            ]
        );

        // Return created row
        return result.rows[0];
    }

    /**
     * Get all appointments (for admin users)
     */
    static async getAllAppointments(): Promise<AppointmentWithUserDetails[]> {
        const result = await pool.query(
            `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
              p.fname as patient_fname, p.lname as patient_lname, p.email as patient_email,
              ph.fname as physician_fname, ph.lname as physician_lname, ph.email as physician_email
       FROM appointments a 
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users ph ON a.physician_id = ph.id
       ORDER BY a.appointment_date DESC`
        );
        return result.rows;
    }

    /**
     * Get appointments for a specific patient
     */
    static async getPatientAppointments(
        patientId: string
    ): Promise<AppointmentWithUserDetails[]> {
        const result = await pool.query(
            `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
              ph.fname as physician_fname, ph.lname as physician_lname, ph.email as physician_email
       FROM appointments a 
       LEFT JOIN users ph ON a.physician_id = ph.id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC`,
            [patientId]
        );
        return result.rows;
    }

    /**
     * Get appointments for a specific physician
     */
    static async getPhysicianAppointments(
        physicianId: string
    ): Promise<AppointmentWithUserDetails[]> {
        const result = await pool.query(
            `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
              p.fname, p.lname, p.email
       FROM appointments a 
       LEFT JOIN users p ON a.patient_id = p.id
       WHERE a.physician_id = $1
       ORDER BY a.appointment_date DESC`,
            [physicianId]
        );
        return result.rows;
    }

    /**
     * Get a single appointment by ID with user details
     */
    static async getAppointmentById(
        appointmentId: string
    ): Promise<AppointmentWithUserDetails | null> {
        const result = await pool.query(
            `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
              p.fname as patient_fname, p.lname as patient_lname, p.email as patient_email,
              ph.fname as physician_fname, ph.lname as physician_lname, ph.email as physician_email
       FROM appointments a 
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users ph ON a.physician_id = ph.id
       WHERE a.id = $1`,
            [appointmentId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Check if a user can access a specific appointment
     */
    static canAccessAppointment(
        user: AuthenticatedUser,
        appointment: Appointment
    ): boolean {
        if (user.type === "Admin") {
            return true;
        } else if (
            user.type === "Patient" &&
            appointment.patient_id === user.id
        ) {
            return true;
        } else if (
            user.type === "Physician" &&
            appointment.physician_id === user.id
        ) {
            return true;
        }
        return false;
    }

    /**
     * Check if a user can update a specific appointment
     */
    static canUpdateAppointment(
        user: AuthenticatedUser,
        appointment: Appointment
    ): boolean {
        if (user.type === "Admin") {
            return true;
        } else if (
            user.type === "Physician" &&
            appointment.physician_id === user.id
        ) {
            return true;
        } else if (
            user.type === "Patient" &&
            appointment.patient_id === user.id
        ) {
            return true; // Note: Patients have limited update fields
        }
        return false;
    }

    /**
     * Check if a user can delete a specific appointment
     */
    static canDeleteAppointment(
        user: AuthenticatedUser,
        appointment: Appointment
    ): boolean {
        if (user.type === "Admin") {
            return true;
        } else if (
            user.type === "Physician" &&
            appointment.physician_id === user.id
        ) {
            return true;
        }
        return false;
    }

    /**
     * Get upcoming appointments for a user (next 30 days)
     */
    static async getUpcomingAppointments(
        user: AuthenticatedUser
    ): Promise<AppointmentWithUserDetails[]> {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        switch (user.type) {
            case "Admin":
                const allUpcomingResult = await pool.query(
                    `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
                  p.fname as patient_fname, p.lname as patient_lname,
                  ph.fname as physician_fname, ph.lname as physician_lname
           FROM appointments a 
           LEFT JOIN users p ON a.patient_id = p.id
           LEFT JOIN users ph ON a.physician_id = ph.id
           WHERE a.appointment_date >= NOW() AND a.appointment_date <= $1
           ORDER BY a.appointment_date ASC`,
                    [thirtyDaysFromNow]
                );
                return allUpcomingResult.rows;

            case "Patient":
                const patientUpcomingResult = await pool.query(
                    `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
                  ph.fname as physician_fname, ph.lname as physician_lname
           FROM appointments a 
           LEFT JOIN users ph ON a.physician_id = ph.id
           WHERE a.patient_id = $1 AND a.appointment_date >= NOW() AND a.appointment_date <= $2
           ORDER BY a.appointment_date ASC`,
                    [user.id, thirtyDaysFromNow]
                );
                return patientUpcomingResult.rows;

            case "Physician":
                const physicianUpcomingResult = await pool.query(
                    `SELECT a.id, a.patient_id, a.physician_id, a.appointment_date, a.reason, a.status, a.notes,
                  p.fname as patient_fname, p.lname as patient_lname
           FROM appointments a 
           LEFT JOIN users p ON a.patient_id = p.id
           WHERE a.physician_id = $1 AND a.appointment_date >= NOW() AND a.appointment_date <= $2
           ORDER BY a.appointment_date ASC`,
                    [user.id, thirtyDaysFromNow]
                );
                return physicianUpcomingResult.rows;

            default:
                return [];
        }
    }
}
