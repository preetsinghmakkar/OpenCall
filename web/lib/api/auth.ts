// lib/api/auth.ts

import { apiClient } from "./client"

/**
 * Matches backend LoginRequest
 */
export interface LoginRequest {
  identifier: string // username OR email
  password: string
}

/**
 * Matches backend UserResponse
 */
export interface User {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  role: string
  profile_picture: string
  bio: string
  is_active: boolean
  created_at: string
}

/**
 * Matches backend LoginResponse
 */
export interface LoginResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient<LoginResponse, LoginRequest>(
      "/api/auth/login",
      {
        method: "POST",
        body: payload,
      }
    )
  },

  refresh(refreshToken: string) {
    return apiClient<{
      access_token: string
      refresh_token: string
      expires_in: number
    }, { refresh_token: string }>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: { refresh_token: refreshToken },
      }
    )
  },
}

