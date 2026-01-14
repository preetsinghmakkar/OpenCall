// lib/api/mentor.ts

import { apiClient } from "./client"

/**
 * Matches backend CreateMentorProfileRequest
 */
export interface CreateMentorProfileRequest {
  title: string // required, min 3 chars
  bio?: string
  timezone: string // required
}

/**
 * Matches backend CreateMentorProfileResponse
 */
export interface CreateMentorProfileResponse {
  id: string
  user_id: string
  title: string
  bio: string
  timezone: string
  is_active: boolean
  created_at: string
}

/**
 * Matches backend MentorUserInfo
 */
export interface MentorUserInfo {
  id: string
  username: string
  first_name: string
  last_name: string
  profile_picture: string
}

/**
 * Matches backend MentorInfo
 */
export interface MentorInfo {
  id: string // mentor_id (UUID)
  title: string
  bio: string
  timezone: string
  is_active: boolean
}

/**
 * Matches backend MentorProfileResponse
 */
export interface MentorProfileResponse {
  user: MentorUserInfo
  mentor: MentorInfo
}

export const mentorApi = {
  /**
   * Get mentor profile by username (public)
   * GET /api/mentors/:username
   */
  getProfile(username: string) {
    return apiClient<MentorProfileResponse>(
      `/api/mentors/${username}`,
      {
        method: "GET",
        skipAuth: true, // Public endpoint
      }
    )
  },

  /**
   * Create mentor profile (protected)
   * POST /api/mentor/profile
   */
  createProfile(payload: CreateMentorProfileRequest) {
    return apiClient<CreateMentorProfileResponse, CreateMentorProfileRequest>(
      "/api/mentor/profile",
      {
        method: "POST",
        body: payload,
      }
    )
  },
}
