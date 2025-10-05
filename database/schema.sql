-- DROP TABLES IF THEY EXIST (in the correct order to handle dependencies)
DROP TABLE IF EXISTS appointments CASCADE;

DROP TABLE IF EXISTS physician_patients CASCADE;

DROP TABLE IF EXISTS medical_history CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- USERS table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- Patient, Admin, etc.
    address VARCHAR(255),
    insurance_provider VARCHAR(100),
    policy_number VARCHAR(50)
);

-- MEDICAL HISTORY table
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    height_in INT,
    weight_lbs INT,
    gender VARCHAR(20),
    primary_care_physician VARCHAR(150),
    emergency_contact VARCHAR(150),
    blood_type VARCHAR(5),
    allergies TEXT,
    history TEXT,
    last_visit DATE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- APPOINTMENTS table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Scheduled',
    notes TEXT
);

-- PHYSICIAN_PATIENTS table (tracks which patients are assigned to which physicians)
CREATE TABLE physician_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    UNIQUE(physician_id, patient_id)
);

-- Indexes for better query performance
CREATE INDEX idx_physician_patients_physician ON physician_patients(physician_id);

CREATE INDEX idx_physician_patients_patient ON physician_patients(patient_id);