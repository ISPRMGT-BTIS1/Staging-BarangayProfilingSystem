import { apiClient } from '@/shared/lib/axios'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

/**
 * Auth service — wraps NestJS /auth endpoints.
 *
 * Currently the frontend uses mockData for authentication.
 * Replace the mock login logic in AuthProvider with these service calls
 * once the NestJS backend is ready.
 */
export const authService = {
  /**
   * POST /auth/login
   * Returns JWT tokens and the authenticated user object.
   */
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/auth/login', credentials),

  /**
   * POST /auth/logout
   * Invalidates the refresh token server-side.
   */
  logout: () =>
    apiClient.post('/auth/logout'),

  /**
   * POST /auth/refresh
   * Exchanges a refresh token for a new access token.
   */
  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),

  /**
   * GET /auth/me
   * Returns the currently authenticated user's profile.
   */
  me: () =>
    apiClient.get('/auth/me'),
}
