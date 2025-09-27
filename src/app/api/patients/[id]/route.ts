import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "../../../../lib/db";
import { UpdatePatientDto, PatientResponse } from "../../../../dto/patient.dto";
import { getAuthenticatedUser } from "../../../../lib/auth";

// GET patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    const { id } = params;

    // Get the patient with full details
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
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const patientData = result.rows[0];

    // Check permissions based on role
    let canAccess = false;
    if (user.type === 'Admin') {
      canAccess = true;
    } else if (user.type === 'Patient' && patientData.id === user.id) {
      canAccess = true;
    } else if (user.type === 'Physician') {
      // TODO: Check if physician is assigned to this patient
      // For now, allow all physicians to access
      canAccess = true;
    }

    if (!canAccess) {
      return NextResponse.json(
        { error: "Unauthorized to access this patient's data" },
        { status: 403 }
      );
    }

    const patientResponse: PatientResponse = {
      ...patientData,
      age: patientData.date_of_birth ? Math.floor(
        (new Date().getTime() - new Date(patientData.date_of_birth).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
      ) : undefined
    };

    return NextResponse.json(patientResponse);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT (update) patient by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    const { id } = params;
    const body: UpdatePatientDto = await request.json();

    // Check if patient exists
    const patientCheck = await pool.query(
      `SELECT u.id, u.type, mh.id as medical_history_id 
             FROM users u
             LEFT JOIN medical_history mh ON u.id = mh.user_id
             WHERE u.id = $1 AND u.type = 'Patient'`,
      [id]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const patient = patientCheck.rows[0];

    // Check permissions
    let canUpdate = false;
    if (user.type === 'Admin') {
      canUpdate = true;
    } else if (user.type === 'Physician') {
      // TODO: Check if physician is assigned to this patient
      canUpdate = true;
    } else if (user.type === 'Patient' && patient.id === user.id) {
      canUpdate = true;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Unauthorized to update this patient" },
        { status: 403 }
      );
    }

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Separate user fields from medical history fields
      const userFields = ['fname', 'lname', 'phone', 'address', 'insurance_provider', 'policy_number'];
      const medicalFields = ['date_of_birth', 'height_in', 'weight_lbs', 'gender', 'primary_care_physician',
        'emergency_contact', 'blood_type', 'allergies', 'history', 'last_visit', 'status'];

      // Handle password update separately if provided
      if (body.password) {
        const hashedPassword = await bcrypt.hash(body.password, 12);
        await pool.query(
          `UPDATE users SET password = $1 WHERE id = $2`,
          [hashedPassword, id]
        );
      }

      // Update user table if there are user fields to update
      const userUpdateFields: string[] = [];
      const userUpdateValues: (string | number | Date | null)[] = [];
      let userParamCount = 1;

      Object.entries(body).forEach(([key, value]) => {
        if (key !== 'password' && value !== undefined && userFields.includes(key)) {
          userUpdateFields.push(`${key} = $${userParamCount}`);
          userUpdateValues.push(value as string | number | Date | null);
          userParamCount++;
        }
      });

      if (userUpdateFields.length > 0) {
        userUpdateValues.push(id);
        const userUpdateQuery = `
                    UPDATE users 
                    SET ${userUpdateFields.join(', ')}
                    WHERE id = $${userParamCount}
                `;
        await pool.query(userUpdateQuery, userUpdateValues);
      }

      // Update medical_history table if there are medical fields to update
      const medicalUpdateFields: string[] = [];
      const medicalUpdateValues: (string | number | Date | null)[] = [];
      let medicalParamCount = 1;

      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && medicalFields.includes(key)) {
          medicalUpdateFields.push(`${key} = $${medicalParamCount}`);
          medicalUpdateValues.push(value as string | number | Date | null);
          medicalParamCount++;
        }
      });

      if (medicalUpdateFields.length > 0 && patient.medical_history_id) {
        medicalUpdateValues.push(patient.medical_history_id);
        const medicalUpdateQuery = `
                    UPDATE medical_history 
                    SET ${medicalUpdateFields.join(', ')}
                    WHERE id = $${medicalParamCount}
                `;
        await pool.query(medicalUpdateQuery, medicalUpdateValues);
      } else if (medicalUpdateFields.length > 0 && !patient.medical_history_id) {
        // Create medical history if it doesn't exist
        const createMedicalHistoryQuery = `
                    INSERT INTO medical_history (user_id, ${medicalFields.filter(f => body[f as keyof typeof body] !== undefined).join(', ')})
                    VALUES ($1, ${medicalFields.filter(f => body[f as keyof typeof body] !== undefined).map((_, i) => `$${i + 2}`).join(', ')})
                `;
        const createValues = [id, ...medicalFields.filter(f => body[f as keyof typeof body] !== undefined).map(f => body[f as keyof typeof body])];
        await pool.query(createMedicalHistoryQuery, createValues);
      }

      // Get updated patient data
      const updatedPatientResult = await pool.query(`
                SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
                       u.insurance_provider, u.policy_number,
                       mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
                       mh.gender, mh.primary_care_physician, mh.emergency_contact, 
                       mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
                FROM users u
                LEFT JOIN medical_history mh ON u.id = mh.user_id
                WHERE u.id = $1
            `, [id]);

      // Commit transaction
      await pool.query('COMMIT');

      const updatedPatient = updatedPatientResult.rows[0];
      const patientResponse: PatientResponse = {
        ...updatedPatient,
        age: updatedPatient.date_of_birth ? Math.floor(
          (new Date().getTime() - new Date(updatedPatient.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
        ) : undefined
      };

      return NextResponse.json(patientResponse);

    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE patient by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    const { id } = params;

    // Check if patient exists
    const patientCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND type = 'Patient'`,
      [id]
    );

    if (patientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Only Admins can delete patients (sensitive operation)
    if (user.type !== 'Admin') {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins can delete patients" },
        { status: 403 }
      );
    }

    // Delete the patient (CASCADE will handle medical_history and appointments)
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND type = 'Patient' RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete patient" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Patient deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
