-- USERS
-- Note: Passwords are stored in plaintext for simplicity; in a real application, use hashed passwords.
INSERT INTO users (fname, lname, email, phone, username, password, type, address, insurance_provider, policy_number) VALUES
('Alice', 'Johnson', 'alice.johnson@example.com', '555-123-4567', 'alicej', 'password123', 'Admin', NULL, NULL, NULL),
('Bob', 'Smith', 'bob.smith@example.com', '555-987-6543', 'bobsmith', 'password123', 'Patient', '123 Maple St, Springfield', 'BlueCross', 'BC123456'),
('Carol', 'White', 'carol.white@example.com', '555-222-3333', 'carolw', 'password123', 'Patient', '456 Oak Ave, Springfield', 'United Health', 'UH789012'),
('Jason', 'Thompson', 'dr.thompson@example.com', '555-444-1111', 'drthompson', 'password123', 'Admin', NULL, NULL, NULL),
('David', 'Miller', 'david.miller@example.com', '555-555-1212', 'davidm', 'password123', 'Patient', '789 Pine Rd, Springfield', 'BlueShield', 'BS345678'),
('Emma', 'Garcia', 'emma.garcia@example.com', '555-666-2323', 'emmag', 'password123', 'Patient', '321 Cedar Ln, Springfield', 'Aetna', 'AE901234'),
('Frank', 'Lopez', 'frank.lopez@example.com', '555-777-3434', 'frankl', 'password123', 'Patient', '654 Birch Blvd, Springfield', 'Cigna', 'CI567890'),
('Grace', 'Nguyen', 'grace.nguyen@example.com', '555-888-4545', 'gracen', 'password123', 'Patient', '987 Elm St, Springfield', 'Kaiser', 'KA234567'),
('Hannah', 'Brown', 'hannah.brown@example.com', '555-999-5656', 'hannahb', 'password123', 'Patient', '159 Walnut St, Springfield', 'BlueCross', 'BC678901'),
('Ivy', 'Clark', 'ivy.clark@example.com', '555-000-6767', 'ivyc', 'password123', 'Admin', NULL, NULL, NULL),
('Mark', 'Davis', 'mark.davis@example.com', '555-111-7878', 'markd', 'password123', 'Admin', NULL, NULL, NULL),
('Sophia', 'Reed', 'dr.reed@example.com', '555-222-8989', 'drreed', 'password123', 'Admin', NULL, NULL, NULL);

-- MEDICAL HISTORY
INSERT INTO medical_history (user_id, date_of_birth, height_in, weight_lbs, gender, primary_care_physician, emergency_contact, blood_type, allergies, history, last_visit, status) VALUES
((SELECT id FROM users WHERE username='bobsmith'), '1985-06-15', 71, 187, 'Male', 'Dr. Thompson', 'Alice Johnson - 555-123-4567', 'O+', 'Penicillin', 'Type 1 Diabetes', '2025-09-01', 'Active'),
((SELECT id FROM users WHERE username='carolw'), '1990-02-28', 65, 150, 'Female', 'Dr. Thompson', 'Bob Smith - 555-987-6543', 'A-', 'None', 'Hip replacement (2013)', '2025-08-20', 'Active'),
((SELECT id FROM users WHERE username='davidm'), '1982-11-12', 70, 200, 'Male', 'Dr. Reed', 'Emma Garcia - 555-666-2323', 'B+', 'Shellfish', 'Hypertension', '2025-09-15', 'Active'),
((SELECT id FROM users WHERE username='emmag'), '1995-04-05', 63, 135, 'Female', 'Dr. Reed', 'David Miller - 555-555-1212', 'O-', 'Peanuts', 'Asthma', '2025-09-10', 'Active'),
((SELECT id FROM users WHERE username='frankl'), '1978-07-22', 72, 210, 'Male', 'Dr. Reed', 'Grace Nguyen - 555-888-4545', 'AB+', 'None', 'High cholesterol', '2025-09-05', 'Active'),
((SELECT id FROM users WHERE username='gracen'), '2000-03-18', 66, 140, 'Female', 'Dr. Reed', 'Frank Lopez - 555-777-3434', 'A+', 'Latex', 'No major history', '2025-08-30', 'Active'),
((SELECT id FROM users WHERE username='hannahb'), '1988-09-30', 68, 160, 'Female', 'Dr. Reed', 'Ivy Clark - 555-000-6767', 'B-', 'None', 'Migraines', '2025-08-25', 'Active');

-- APPOINTMENTS
INSERT INTO appointments (patient_id, physician_id, appointment_date, reason, status, notes) VALUES
((SELECT id FROM users WHERE username='bobsmith'), (SELECT id FROM users WHERE username='drreed'), '2025-09-25 10:00:00', 'Routine checkup', 'Scheduled', 'Patient needs annual labs.'),
((SELECT id FROM users WHERE username='carolw'), (SELECT id FROM users WHERE username='drreed'), '2025-09-28 14:30:00', 'Follow-up on hip replacement', 'Scheduled', 'Review mobility and recovery.'),
((SELECT id FROM users WHERE username='davidm'), (SELECT id FROM users WHERE username='drreed'), '2025-09-30 09:00:00', 'Blood pressure management', 'Scheduled', 'Check medication effectiveness.'),
((SELECT id FROM users WHERE username='emmag'), (SELECT id FROM users WHERE username='drreed'), '2025-10-02 11:00:00', 'Asthma follow-up', 'Scheduled', 'Discuss inhaler usage.'),
((SELECT id FROM users WHERE username='frankl'), (SELECT id FROM users WHERE username='drreed'), '2025-10-05 15:00:00', 'Cholesterol check', 'Scheduled', 'Review recent lab results.'),
((SELECT id FROM users WHERE username='gracen'), (SELECT id FROM users WHERE username='drreed'), '2025-10-08 13:30:00', 'Annual physical', 'Scheduled', 'First adult physical exam.'),
((SELECT id FROM users WHERE username='hannahb'), (SELECT id FROM users WHERE username='drreed'), '2025-10-12 16:00:00', 'Migraine evaluation', 'Scheduled', 'Discuss frequency and triggers.');
