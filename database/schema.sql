-- Drop tables if they exist (reset schema easily in dev)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medical_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Admin', 'Patient')) NOT NULL
);

-- MEDICAL HISTORY table
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    height_in INT,   -- height in inches
    weight_lbs INT,  -- weight in pounds
    primary_care_physician VARCHAR(150),
    emergency_contact VARCHAR(150),
    blood_type VARCHAR(5),
    history TEXT
);

-- APPOINTMENTS table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Scheduled',
    notes TEXT
);
