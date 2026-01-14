// lib/api/users.ts

import { apiClient } from "./client"

/**
 * Matches backend PublicUserResponse
 */
export interface PublicUserResponse {
  id: string
  username: string
  first_name: string
  last_name: string
  profile_picture: string
  bio: string
}

/**
 * Matches backend MentorPreview
 */
export interface MentorPreview {
  title: string
}

/**
 * Matches backend UserProfileResponse
 */
export interface UserProfileResponse {
  user: PublicUserResponse
  is_mentor: boolean
  mentor: MentorPreview | null
}

export const usersApi = {
  /**
   * Get user profile by username (public)
   * GET /api/users/:username
   */
  getProfile(username: string) {
    return apiClient<UserProfileResponse>(
      `/api/users/${username}`,
      {
        method: "GET",
        skipAuth: true, // Public endpoint
      }
    )
  },
}
