// lib/api/services.ts

import { apiClient } from "./client"

/**
 * Matches backend CreateMentorServiceRequest
 */
export interface CreateMentorServiceRequest {
  title: string // required, min 3 chars
  description?: string
  duration_minutes: 30 // required (30 minutes only)
  price_cents: number // required, min 0
  currency: string // required, exactly 3 characters (e.g., "USD")
}

/**
 * Matches backend MentorServiceResponse
 */
export interface MentorServiceResponse {
  id: string
  title: string
  description: string
  duration_minutes: number
  price_cents: number
  currency: string
  is_active: boolean
}

export const servicesApi = {
  /**
   * Get mentor services by username (public)
   * GET /api/mentors/:username/services
   */
  getByUsername(username: string) {
    return apiClient<MentorServiceResponse[]>(
      `/api/mentors/${username}/services`,
      {
        method: "GET",
        skipAuth: true, // Public endpoint
      }
    )
  },

  /**
   * Create mentor service (protected)
   * POST /api/mentor/services
   */
  create(payload: CreateMentorServiceRequest) {
    return apiClient<MentorServiceResponse, CreateMentorServiceRequest>(
      "/api/mentor/services",
      {
        method: "POST",
        body: payload,
      }
    )
  },
}
