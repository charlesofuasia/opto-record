import type { MedicalHistory } from "../types/medical-history";

export type CreateMedicalHistoryDto = Omit<MedicalHistory, "id">;

export type UpdateMedicalHistoryDto = Partial<Omit<MedicalHistory, "id" | "user_id">>;
