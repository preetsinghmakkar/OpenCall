// lib/api/availability.ts

import { apiClient } from "./client"

/**
 * Matches backend CreateMentorAvailabilityRequest
 */
export interface CreateMentorAvailabilityRequest {
  day_of_week: number // required, 0-6 (0 = Sunday, 6 = Saturday)
  start_time: string // required, format "HH:MM" (e.g., "10:00")
  end_time: string // required, format "HH:MM" (e.g., "18:00")
}

/**
 * Matches backend MentorAvailabilityResponse
 */
export interface MentorAvailabilityResponse {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

/**
 * Matches backend AvailableSlot
 */
export interface AvailableSlot {
  start: string // format "HH:MM"
  end: string // format "HH:MM"
}

/**
 * Matches backend AvailabilityResponse
 */
export interface AvailabilityResponse {
  date: string // format "YYYY-MM-DD"
  slots: AvailableSlot[]
}

export const availabilityApi = {
  /**
   * Get mentor availability rules by username (public)
   * GET /api/mentors/:username/availability
   */
  getRulesByUsername(username: string) {
    return apiClient<MentorAvailabilityResponse[]>(
      `/api/mentors/${username}/availability`,
      {
        method: "GET",
        skipAuth: true, // Public endpoint
      }
    )
  },

  /**
   * Get available booking slots for a specific date and service (public)
   * GET /mentors/:username/availability?date=YYYY-MM-DD&service_id=uuid
   */
  getAvailableSlots(
    username: string,
    params: {
      date: string // format "YYYY-MM-DD"
      service_id: string // UUID
    }
  ) {
    const queryParams = new URLSearchParams({
      date: params.date,
      service_id: params.service_id,
    })

    return apiClient<AvailabilityResponse>(
      `/mentors/${username}/availability?${queryParams.toString()}`,
      {
        method: "GET",
        skipAuth: true, // Public endpoint
      }
    )
  },

  /**
   * Create availability rule (protected)
   * POST /api/mentor/availability
   */
  createRule(payload: CreateMentorAvailabilityRequest) {
    return apiClient<
      MentorAvailabilityResponse,
      CreateMentorAvailabilityRequest
    >("/api/mentor/availability", {
      method: "POST",
      body: payload,
    })
  },
}
