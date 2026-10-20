import { api, jsonBody } from './api';
import type { ApiEnvelope, User } from '@/types/api';

export type AuthResult = { accessToken: string; tokenType: 'Bearer'; expiresIn: number; user: User };

export const authService = {
  async login(identifier: string, password: string) {
    return api<ApiEnvelope<AuthResult>>('/api/auth/login', jsonBody({ identifier, password }));
  },
  async register(input: { fullName: string; email?: string; phone: string; password: string }) {
    return api<ApiEnvelope<AuthResult>>('/api/auth/register', jsonBody(input));
  },
};
