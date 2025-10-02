# OptO Record API Documentation

This document provides comprehensive documentation for all API endpoints available in the OptO Record medical practice management system.

## Base Information

- **Base URL**: `/api`
- **Authentication**: JWT token required for protected endpoints (stored in HTTP-only cookies)
- **Content-Type**: `application/json`
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

## 🔐 Authentication & JWT Protection

### JWT Token Information

- **Token Storage**: HTTP-only cookie named `auth-token`
- **Token Expiration**: 24 hours
- **Middleware Protection**: All routes under `/api/*` are protected except:
  - `/api/auth/login` (Public)
  - `/api/auth/register` (Public)
  - `/api/auth/logout` (Public)

### JWT Token Structure

```json
{
  "id": "string", // User ID
  "username": "string", // Username
  "email": "string", // User email
  "type": "string", // User role (Admin|Patient|Physician)
  "iat": "number", // Issued at timestamp
  "exp": "number" // Expiration timestamp
}
```

### Request Headers (Injected by Middleware)

Protected endpoints automatically receive these headers:

- `x-user-id`: User ID from JWT
- `x-user-type`: User role from JWT
- `x-user-username`: Username from JWT
- `x-user-email`: Email from JWT

---

## Authentication Endpoints

### User Authentication

#### POST `/api/auth/login` 🌐 **PUBLIC**

Authenticate a user and receive a JWT token.

**Request Schema:**

```typescript
{
  username: string; // Required - username or email
  password: string; // Required - user password
}
```

**Example Request:**

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fname": "John",
    "lname": "Doe",
    "email": "john.doe@example.com",
    "username": "john_doe",
    "type": "Patient",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "insurance_provider": "Blue Cross",
    "policy_number": "BC123456"
  }
}
```

**Error Responses:**

- **400 Bad Request**: Missing username or password
- **401 Unauthorized**: Invalid credentials
- **500 Internal Server Error**: Server error

#### POST `/api/auth/register` 🌐 **PUBLIC**

Register a new user account.

**Request Schema (CreateUserDto):**

```typescript
{
  fname: string;                    // Required
  lname: string;                    // Required
  email: string;                    // Required
  username: string;                 // Required
  password: string;                 // Required
  type?: "Patient" | "Admin" | "Physician";  // Optional, default: "Patient"
  phone?: string | null;            // Optional
  address?: string | null;          // Optional
  insurance_provider?: string | null; // Optional
  policy_number?: string | null;    // Optional
}
```

**Example Request:**

```json
{
  "fname": "Jane",
  "lname": "Smith",
  "email": "jane.smith@example.com",
  "username": "jane_smith",
  "password": "securePassword123",
  "type": "Patient",
  "phone": "+1987654321",
  "address": "456 Oak Ave, City, State 67890",
  "insurance_provider": "Aetna",
  "policy_number": "AE789012"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "fname": "Jane",
    "lname": "Smith",
    "email": "jane.smith@example.com",
    "username": "jane_smith",
    "type": "Patient"
  }
}
```

**Error Responses:**

- **400 Bad Request**: Missing required fields or validation error
- **409 Conflict**: Email or username already exists
- **500 Internal Server Error**: Server error

#### POST `/api/auth/logout` 🔒 **PROTECTED**

Logout the current user and clear authentication cookie.

**Success Response (200):**

```json
{
  "message": "Logout successful"
}
```

---

## User Management

### Users

#### GET `/api/users` 🔒 **PROTECTED**

Get list of users with role-based filtering.

**Authorization:**

- **Admin**: Access to all users
- **Patient**: Access to own data only
- **Physician**: Access to assigned patients

**Example Request:**

```
GET /api/users
```

**Success Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fname": "John",
    "lname": "Doe",
    "email": "john.doe@example.com",
    "username": "john_doe",
    "type": "Patient",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "insurance_provider": "Blue Cross",
    "policy_number": "BC123456"
  }
]
```

**Error Responses:**

- **403 Forbidden**: Non-admin users should use `/api/users/me`

#### GET `/api/users/me` 🔒 **PROTECTED**

Get current authenticated user's information.

**Authorization:** All authenticated users (Admin, Patient, Physician)

**Example Request:**

```
GET /api/users/me
```

**Success Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fname": "John",
  "lname": "Doe",
  "email": "john.doe@example.com",
  "username": "john_doe",
  "type": "Patient",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345",
  "insurance_provider": "Blue Cross",
  "policy_number": "BC123456"
}
```

**Error Responses:**

- **404 Not Found**: User not found in database

#### POST `/api/users` 🔒 **PROTECTED** (Admin Only)

Create a new user.

**Authorization:** Admin only

**Request Schema (CreateUserDto):** Same as registration

**Success Response (201):** Same as registration success response

#### GET `/api/users/{id}` 🔒 **PROTECTED**

Get a specific user by ID.

**Authorization:**

- **Admin**: Any user
- **Patient**: Self only
- **Physician**: Assigned patients

**Path Parameters:**

- `id` (required): User ID (UUID)

**Example Request:**

```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200):** Single user object (same structure as GET users array item)

#### PUT `/api/users/{id}` 🔒 **PROTECTED**

Update a specific user.

**Authorization:**

- **Admin**: Any user
- **Patient**: Self only
- **Physician**: Assigned patients

**Request Schema (UpdateUserDto):**

```typescript
{
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;              // Will be hashed
  type?: "Patient" | "Admin" | "Physician";
  phone?: string | null;
  address?: string | null;
  insurance_provider?: string | null;
  policy_number?: string | null;
}
```

**Success Response (200):** Updated user object

#### DELETE `/api/users/{id}` 🔒 **PROTECTED** (Admin Only)

Delete a specific user.

**Authorization:** Admin only

**Success Response (200):**

```json
{
  "message": "User deleted successfully"
}
```

---

## Appointments

### Appointment Management

#### GET `/api/appointments` 🔒 **PROTECTED**

Get list of appointments with role-based filtering.

**Authorization:**

- **Admin**: All appointments
- **Patient**: Own appointments only
- **Physician**: Assigned appointments

**Example Request:**

```
GET /api/appointments
```

**Success Response (200):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "physician_id": "880e8400-e29b-41d4-a716-446655440000",
    "date_time": "2025-09-28T14:30:00.000Z",
    "status": "Scheduled",
    "notes": "Annual checkup",
    "created_at": "2025-09-27T10:00:00.000Z",
    "patient_name": "John Doe",
    "physician_name": "Dr. Sarah Wilson"
  }
]
```

#### POST `/api/appointments` 🔒 **PROTECTED**

Create a new appointment.

**Authorization:**

- **Admin**: Any appointment
- **Patient**: Own appointments only
- **Physician**: Can create appointments

**Request Schema (CreateAppointmentDto):**

```typescript
{
  patient_id: string;           // Required - Patient UUID
  physician_id: string;         // Required - Physician UUID
  appointment_date: string;     // Required - ISO 8601 date
  reason?: string;              // Optional - Reason for appointment
  status?: string;              // Optional - Default: "Scheduled"
  notes?: string;               // Optional - Additional notes
}
```

**Example Request:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "physician_id": "880e8400-e29b-41d4-a716-446655440000",
  "appointment_date": "2025-09-30T15:00:00.000Z",
  "reason": "Follow-up consultation",
  "status": "Scheduled",
  "notes": "Patient reports improvement"
}
```

**Success Response (201):** Created appointment object

#### GET `/api/appointments/{id}` 🔒 **PROTECTED**

Get a specific appointment by ID.

**Authorization:**

- **Admin**: Any appointment
- **Patient**: Own appointment only
- **Physician**: Assigned appointment

**Success Response (200):** Single appointment object

#### PUT `/api/appointments/{id}` 🔒 **PROTECTED**

Update a specific appointment.

**Request Schema (UpdateAppointmentDto):**

```typescript
{
  appointment_date?: string;    // Optional - ISO 8601 date
  reason?: string;              // Optional
  status?: string;              // Optional
  notes?: string;               // Optional
}
```

**Success Response (200):** Updated appointment object

#### DELETE `/api/appointments/{id}` 🔒 **PROTECTED**

Cancel/delete a specific appointment.

**Success Response (200):**

```json
{
  "message": "Appointment cancelled successfully"
}
```

#### GET `/api/appointments/upcoming` 🔒 **PROTECTED**

Get upcoming appointments.

**Success Response (200):** Array of upcoming appointments

---

## Medical History

### Medical Records Management

#### GET `/api/medical-history` 🔒 **PROTECTED**

Get medical history records with role-based access.

**Authorization:**

- **Admin**: All records
- **Patient**: Own record only
- **Physician**: Assigned patients

**Success Response (200):**

```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "date_of_birth": "1985-03-15T00:00:00.000Z",
    "height_in": 68,
    "weight_lbs": 150,
    "gender": "Male",
    "primary_care_physician": "Dr. Sarah Wilson",
    "emergency_contact": "Jane Doe - 555-0123",
    "blood_type": "A+",
    "allergies": "Penicillin, Shellfish",
    "history": "No significant medical history",
    "last_visit": "2025-09-15T10:30:00.000Z",
    "status": "Active"
  }
]
```

#### POST `/api/medical-history` 🔒 **PROTECTED**

Create a new medical history record.

**Authorization:** Admin, Physician

**Request Schema (CreateMedicalHistoryDto):**

```typescript
{
  user_id: string;                      // Required - Patient UUID
  date_of_birth: Date;                  // Required
  height_in?: number | null;            // Optional - Height in inches
  weight_lbs?: number | null;           // Optional - Weight in pounds
  gender?: "Male" | "Female" | "Other" | string | null;
  primary_care_physician?: string | null;
  emergency_contact?: string | null;
  blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | string | null;
  allergies?: string | null;
  history?: string | null;              // Medical history text
  last_visit?: Date | null;
  status?: "active" | "inactive" | "archived" | string;
}
```

**Example Request:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date_of_birth": "1985-03-15T00:00:00.000Z",
  "height_in": 68,
  "weight_lbs": 150,
  "gender": "Male",
  "primary_care_physician": "Dr. Sarah Wilson",
  "emergency_contact": "Jane Doe - 555-0123",
  "blood_type": "A+",
  "allergies": "Penicillin, Shellfish",
  "history": "No significant medical history",
  "status": "Active"
}
```

#### GET `/api/medical-history/{id}` 🔒 **PROTECTED**

Get a specific medical history record by ID.

#### PUT `/api/medical-history/{id}` 🔒 **PROTECTED**

Update a specific medical history record.

**Request Schema (UpdateMedicalHistoryDto):**

```typescript
{
  date_of_birth?: Date;
  height_in?: number | null;
  weight_lbs?: number | null;
  gender?: "Male" | "Female" | "Other" | string | null;
  primary_care_physician?: string | null;
  emergency_contact?: string | null;
  blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | string | null;
  allergies?: string | null;
  history?: string | null;
  last_visit?: Date | null;
  status?: "active" | "inactive" | "archived" | string;
}
```

#### DELETE `/api/medical-history/{id}` 🔒 **PROTECTED** (Admin Only)

Delete a specific medical history record.

**Authorization:** Admin only

#### GET `/api/medical-history/stats` 🔒 **PROTECTED**

Get medical history statistics.

**Authorization:** Admin, Physician

**Success Response (200):**

```json
{
  "total_records": 1250,
  "active_records": 1100,
  "inactive_records": 150,
  "avg_age": 42.5,
  "records_by_gender": {
    "Male": 600,
    "Female": 620,
    "Other": 30
  },
  "records_by_blood_type": {
    "O+": 375,
    "A+": 320,
    "B+": 150,
    "AB+": 40,
    "O-": 200,
    "A-": 100,
    "B-": 45,
    "AB-": 20
  }
}
```

#### GET `/api/medical-history/search` 🔒 **PROTECTED**

Search medical history records.

**Authorization:** Admin, Physician

**Query Parameters:**

- `q` (required): Search query

#### GET `/api/medical-history/user/{userId}` 🔒 **PROTECTED**

Get medical history for a specific user.

#### GET `/api/medical-history/patients/without-history` 🔒 **PROTECTED**

Get patients without medical history records.

**Authorization:** Admin, Physician

---

## Patient Management

### Unified Patient Operations

#### GET `/api/patients` 🔒 **PROTECTED**

Get list of patients with combined user and medical data.

**Authorization:**

- **Admin**: All patients
- **Physician**: Assigned patients

**Success Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fname": "John",
    "lname": "Doe",
    "email": "john.doe@example.com",
    "username": "john_doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "insurance_provider": "Blue Cross",
    "policy_number": "BC123456",
    "medical_history_id": "990e8400-e29b-41d4-a716-446655440000",
    "date_of_birth": "1985-03-15T00:00:00.000Z",
    "height_in": 68,
    "weight_lbs": 150,
    "gender": "Male",
    "primary_care_physician": "Dr. Sarah Wilson",
    "emergency_contact": "Jane Doe - 555-0123",
    "blood_type": "A+",
    "allergies": "Penicillin, Shellfish",
    "history": "No significant medical history",
    "last_visit": "2025-09-15T10:30:00.000Z",
    "status": "Active",
    "age": 40
  }
]
```

#### POST `/api/patients` 🔒 **PROTECTED**

Create a new patient with user account and medical history.

**Authorization:** Admin, Physician

**Request Schema (CreatePatientDto):**

```typescript
{
  // User fields (required)
  fname: string;
  lname: string;
  email: string;
  username: string;
  password: string;

  // User fields (optional)
  phone?: string | null;
  address?: string | null;
  insurance_provider?: string | null;
  policy_number?: string | null;

  // Medical history fields (optional)
  date_of_birth: Date | string;
  height_in?: number | null;
  weight_lbs?: number | null;
  gender?: string | null;
  primary_care_physician?: string | null;
  emergency_contact?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  history?: string | null;
  last_visit?: Date | string | null;
  status?: string;
}
```

**Example Request:**

```json
{
  "fname": "Michael",
  "lname": "Johnson",
  "email": "michael.johnson@example.com",
  "username": "mjohnson",
  "password": "securePass456",
  "phone": "+1555123456",
  "address": "789 Pine St, City, State 54321",
  "insurance_provider": "United Healthcare",
  "policy_number": "UH987654",
  "date_of_birth": "1990-07-20T00:00:00.000Z",
  "height_in": 72,
  "weight_lbs": 180,
  "gender": "Male",
  "primary_care_physician": "Dr. Sarah Wilson",
  "emergency_contact": "Lisa Johnson - 555-0456",
  "blood_type": "O+",
  "allergies": "None known",
  "history": "No significant medical history",
  "status": "Active"
}
```

**Success Response (201):** Created patient object (same structure as GET response)

#### GET `/api/patients/{id}` 🔒 **PROTECTED**

Get a specific patient with full details.

**Authorization:**

- **Admin**: Any patient
- **Patient**: Self only
- **Physician**: Assigned patient

#### PUT `/api/patients/{id}` 🔒 **PROTECTED**

Update a specific patient's information.

**Request Schema (UpdatePatientDto):**

```typescript
{
  fname?: string;
  lname?: string;
  password?: string;                    // Will be hashed
  phone?: string | null;
  address?: string | null;
  insurance_provider?: string | null;
  policy_number?: string | null;
  date_of_birth?: Date | string;
  height_in?: number | null;
  weight_lbs?: number | null;
  gender?: string | null;
  primary_care_physician?: string | null;
  emergency_contact?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  history?: string | null;
  last_visit?: Date | string | null;
  status?: string;
}
```

#### DELETE `/api/patients/{id}` 🔒 **PROTECTED** (Admin Only)

Delete a specific patient.

**Authorization:** Admin only

#### GET `/api/patients/stats` 🔒 **PROTECTED**

Get patient statistics.

**Authorization:** Admin, Physician

**Success Response (200):**

```json
{
  "total_patients": 1000,
  "active_patients": 850,
  "inactive_patients": 150,
  "pediatric_patients": 200,
  "senior_patients": 300,
  "avg_age": 42.3
}
```

#### GET `/api/patients/search` 🔒 **PROTECTED**

Search patients.

**Authorization:**

- **Admin**: Search all patients
- **Physician**: Search assigned patients
- **Patient**: Search self only

**Query Parameters:**

- `q` (required): Search query
- `limit` (optional): Maximum number of results (default: 20)

#### GET `/api/patients/{id}/activity` 🔒 **PROTECTED**

Get patient activity history.

**Authorization:**

- **Admin**: Any patient
- **Patient**: Self only
- **Physician**: Assigned patient

**Query Parameters:**

- `limit` (optional): Maximum number of results (default: 10)

**Success Response (200):**

```json
[
  {
    "activity_type": "appointment",
    "activity_date": "2025-09-15T10:30:00.000Z",
    "activity_status": "Completed",
    "activity_details": "Annual checkup - all vitals normal",
    "physician_name": "Dr. Sarah Wilson"
  },
  {
    "activity_type": "medical_history_update",
    "activity_date": "2025-09-10T14:00:00.000Z",
    "activity_status": "Active",
    "activity_details": "Medical history updated",
    "physician_name": "Dr. Sarah Wilson"
  }
]
```

---

## Dashboard

### Dashboard Data

#### GET `/api/dashboard` 🔒 **PROTECTED**

Get dashboard statistics and overview data.

**Authorization:** Admin, Physician

**Success Response (200):**

```json
{
  "total_patients": 1000,
  "total_appointments": 2500,
  "upcoming_appointments": 45,
  "recent_activity": [
    {
      "type": "appointment_created",
      "timestamp": "2025-09-27T10:30:00.000Z",
      "details": "New appointment scheduled for John Doe"
    }
  ]
}
```

---

## Standard Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

**Validation Error:**

```json
{
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**Missing Required Field:**

```json
{
  "error": "fname is required"
}
```

### 401 Unauthorized

**Missing Authentication:**

```json
{
  "error": "Authentication required"
}
```

**Invalid Token:**

```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

**Insufficient Permissions:**

```json
{
  "error": "Unauthorized. Only Admins can delete patients"
}
```

**Role-Based Access Denied:**

```json
{
  "error": "Unauthorized to access this patient's data"
}
```

### 404 Not Found

```json
{
  "error": "Patient not found"
}
```

### 409 Conflict

**Duplicate Resource:**

```json
{
  "error": "Email already exists"
}
```

**Business Logic Violation:**

```json
{
  "error": "Patient already has a medical history record"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

**Database Error:**

```json
{
  "error": "Database connection failed"
}
```

---

## User Roles & Permissions

### 👑 Admin

- **Full System Access**: Complete CRUD operations on all resources
- **User Management**: Create, update, delete any user account
- **Data Access**: View all patients, appointments, and medical records
- **Statistics**: Access to all reporting and analytics endpoints
- **Deletion Rights**: Only role that can permanently delete records

### 🩺 Physician

- **Patient Management**: Access to assigned patients' complete data
- **Appointments**: Create, view, update appointments for assigned patients
- **Medical Records**: Full CRUD on medical history for assigned patients
- **Statistics**: Access to aggregate statistics and reporting
- **Limitations**: Cannot delete users or medical history records

### 🏥 Patient

- **Self-Service**: View and update own profile and medical information
- **Appointments**: View own appointments, create new appointment requests
- **Medical History**: View own medical records, limited update permissions
- **Privacy**: Cannot access other patients' data
- **Limitations**: Cannot delete own account or medical records
