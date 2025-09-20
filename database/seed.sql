-- USERS
INSERT INTO users (fname, lname, email, phone, username, password, type) VALUES
('Alice', 'Johnson', 'alice.johnson@example.com', '555-123-4567', 'alicej', 'password123', 'Admin'),
('Bob', 'Smith', 'bob.smith@example.com', '555-987-6543', 'bobsmith', 'password123', 'Patient'),
('Carol', 'White', 'carol.white@example.com', '555-222-3333', 'carolw', 'password123', 'Patient'),
('Jason', 'Thompson', 'dr.thompson@example.com', '555-444-1111', 'drthompson', 'password123', 'Admin');

-- MEDICAL HISTORY
INSERT INTO medical_history (user_id, date_of_birth, height_in, weight_lbs, primary_care_physician, emergency_contact, blood_type, history) VALUES
((SELECT id FROM users WHERE username='bobsmith'), '1985-06-15', 71, 187, 'Dr. Thompson', 'Alice Johnson - 555-123-4567', 'O+', 'Type 1 Diabetes'),
((SELECT id FROM users WHERE username='carolw'), '1990-02-28', 65, 150, 'Dr. Thompson', 'Bob Smith - 555-987-6543', 'A-', 'Hip replacement (2013)');

-- APPOINTMENTS
INSERT INTO appointments (patient_id, physician_id, appointment_date, reason, status, notes) VALUES
((SELECT id FROM users WHERE username='bobsmith'), (SELECT id FROM users WHERE username='drthompson'), '2025-09-25 10:00:00', 'Routine checkup', 'Scheduled', 'Patient needs annual labs.'),
((SELECT id FROM users WHERE username='carolw'), (SELECT id FROM users WHERE username='drthompson'), '2025-09-28 14:30:00', 'Follow-up on hip replacement', 'Scheduled', 'Review mobility and recovery.');
