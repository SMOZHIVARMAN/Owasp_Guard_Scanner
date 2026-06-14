import { api } from "@/app/lib/apiClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/app/types";

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },
  async register(payload: RegisterRequest): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/auth/register", payload);
    return data;
  },
};
