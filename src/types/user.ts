export type UserType = "Patient" | "Admin" | "Physician" | string;

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone?: string | null;
  username: string;
  password: string;
  type: UserType;
  address?: string | null;
  insurance_provider?: string | null;
  policy_number?: string | null;
}

export type UserWithMedicalHistory = User & {
  date_of_birth: string | null;
  gender: string | null;
};
