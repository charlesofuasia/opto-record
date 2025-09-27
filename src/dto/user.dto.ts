import type { User } from "../types/user";

export type CreateUserDto = Omit<User, "id">;

export type UpdateUserDto = Partial<Omit<User, "id">>;
