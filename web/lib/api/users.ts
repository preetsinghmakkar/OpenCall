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

/**
 * Matches backend UpdateUserProfileResponse
 */
export interface UpdateUserProfileResponse {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  bio: string
  profile_picture: string
  role: string
  is_active: boolean
  message: string
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

  /**
   * Update user profile (protected)
   * PUT /api/users/profile
   */
  async updateProfile(data: {
    firstName: string
    lastName: string
    email: string
    bio: string
    profilePicture?: File
  }) {
    const formData = new FormData()
    formData.append("firstName", data.firstName)
    formData.append("lastName", data.lastName)
    formData.append("email", data.email)
    formData.append("bio", data.bio)
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture)
    }

    return apiClient<UpdateUserProfileResponse>("/api/users/profile", {
      method: "PUT",
      body: formData,
      skipContentType: true, // Let browser set multipart/form-data
    })
  },
}
