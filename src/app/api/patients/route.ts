import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "../../../lib/db";
import { CreatePatientDto, UpdatePatientDto, PatientResponse } from "../../../dto/patient.dto";
import { getAuthenticatedUser } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    // Role-based access control
    switch (user.type) {
      case 'Admin':
        // Admin: gets all patients
        break;
      case 'Physician':
        // Physician: gets their assigned patients (TODO: implement when relationship exists)
        break;
      case 'Patient':
        // Patients can only see themselves, redirect to specific endpoint
        return NextResponse.json(
          { error: "Patients should use /api/patients/{id} endpoint" },
          { status: 403 }
        );
      default:
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
    }

    const result = await pool.query(`
      SELECT u.id, u.fname, u.lname, u.email, u.username, u.phone, u.address, 
             u.insurance_provider, u.policy_number,
             mh.id as medical_history_id, mh.date_of_birth, mh.height_in, mh.weight_lbs, 
             mh.gender, mh.primary_care_physician, mh.emergency_contact, 
             mh.blood_type, mh.allergies, mh.history, mh.last_visit, mh.status
      FROM users u
      LEFT JOIN medical_history mh ON u.id = mh.user_id
      WHERE u.type = 'Patient'
      ORDER BY u.fname, u.lname
    `);

    const patients: PatientResponse[] = result.rows.map((p: Record<string, unknown>) => ({
      id: p.id,
      fname: p.fname,
      lname: p.lname,
      email: p.email,
      username: p.username,
      phone: p.phone,
      address: p.address,
      insurance_provider: p.insurance_provider,
      policy_number: p.policy_number,
      date_of_birth: p.date_of_birth,
      height_in: p.height_in,
      weight_lbs: p.weight_lbs,
      gender: p.gender,
      primary_care_physician: p.primary_care_physician,
      emergency_contact: p.emergency_contact,
      blood_type: p.blood_type,
      allergies: p.allergies,
      history: p.history,
      last_visit: p.last_visit,
      status: p.status || "Active",
      age: p.date_of_birth ? Math.floor(
        (new Date().getTime() - new Date(p.date_of_birth as string).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
      ) : undefined,
      medical_history_id: p.medical_history_id
    }));

    return NextResponse.json({patients});
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    // Only Admins and Physicians can create patients
    if (user.type !== 'Admin' && user.type !== 'Physician') {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins and Physicians can create patients" },
        { status: 403 }
      );
    }

    const body: CreatePatientDto = await request.json();

    // Validate required fields
    const requiredFields = ['fname', 'lname', 'email', 'username', 'password', 'date_of_birth'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreatePatientDto]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Check if email or username already exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2`,
      [body.email, body.username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Validate date_of_birth format
    const dateOfBirth = new Date(body.date_of_birth);
    if (isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        { error: "Invalid date_of_birth format" },
        { status: 400 }
      );
    }

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (fname, lname, email, phone, username, password, type, address, insurance_provider, policy_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, fname, lname, email, username, phone, address, insurance_provider, policy_number`,
        [
          body.fname,
          body.lname,
          body.email,
          body.phone || null,
          body.username,
          hashedPassword,
          'Patient',
          body.address || null,
          body.insurance_provider || null,
          body.policy_number || null
        ]
      );

      const newUser = userResult.rows[0];

      // Create medical history
      const medicalHistoryResult = await pool.query(
        `INSERT INTO medical_history (user_id, date_of_birth, height_in, weight_lbs, gender, 
                                    primary_care_physician, emergency_contact, blood_type, 
                                    allergies, history, last_visit, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, date_of_birth, height_in, weight_lbs, gender, 
                  primary_care_physician, emergency_contact, blood_type, 
                  allergies, history, last_visit, status`,
        [
          newUser.id,
          body.date_of_birth,
          body.height_in || null,
          body.weight_lbs || null,
          body.gender || null,
          body.primary_care_physician || null,
          body.emergency_contact || null,
          body.blood_type || null,
          body.allergies || null,
          body.history || null,
          body.last_visit || new Date(),
          body.status || 'active'
        ]
      );

      const medicalHistory = medicalHistoryResult.rows[0];

      // Commit transaction
      await pool.query('COMMIT');

      const patientResponse: PatientResponse = {
        ...newUser,
        ...medicalHistory,
        age: Math.floor(
          (new Date().getTime() - new Date(medicalHistory.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
        ),
        medical_history_id: medicalHistory.id
      };

      return NextResponse.json(patientResponse, { status: 201 });

    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const body: UpdatePatientDto & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patientCheck = await pool.query(
      `SELECT u.id, u.type, mh.id as medical_history_id 
       FROM users u
       LEFT JOIN medical_history mh ON u.id = mh.user_id
       WHERE u.id = $1 AND u.type = 'Patient'`,
      [body.id]
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

      // Update user table if there are user fields to update
      const userUpdateFields: string[] = [];
      const userUpdateValues: (string | number | Date | null)[] = [];
      let userParamCount = 1;

      Object.entries(body).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined && userFields.includes(key)) {
          userUpdateFields.push(`${key} = $${userParamCount}`);
          userUpdateValues.push(value as string | number | Date | null);
          userParamCount++;
        }
      });

      if (userUpdateFields.length > 0) {
        userUpdateValues.push(body.id);
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
        if (key !== 'id' && value !== undefined && medicalFields.includes(key)) {
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
      `, [body.id]);

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

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("id");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patientCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND type = 'Patient'`,
      [patientId]
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
      [patientId]
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
