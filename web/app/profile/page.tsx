"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi, type UserProfileResponse } from "@/lib/api/users"
import { mentorApi, type MentorProfileResponse } from "@/lib/api/mentor"
import { toast } from "sonner"
import Link from "next/link"

function ProfileContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null)
  const [mentorProfile, setMentorProfile] = useState<MentorProfileResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.username) {
          throw new Error("User not authenticated")
        }

        console.log("[ProfilePage] Loading profile for:", user.username)
        setLoading(true)
        setError("")

        // Fetch user profile
        const userProf = await usersApi.getProfile(user.username)
        console.log("[ProfilePage] User profile loaded:", userProf)
        setUserProfile(userProf)

        // If user is a mentor, fetch mentor profile
        if (userProf.is_mentor) {
          try {
            const mentorProf = await mentorApi.getProfile(user.username)
            console.log("[ProfilePage] Mentor profile loaded:", mentorProf)
            setMentorProfile(mentorProf)
          } catch (err) {
            console.warn("[ProfilePage] Could not load mentor profile:", err)
            toast.warning("Could not load mentor profile details")
          }
        }

        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load profile"
        console.error("[ProfilePage] Error:", err)
        setError(message)
        setLoading(false)
        toast.error(message)
      }
    }

    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navigation />
        <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
          <h2 className="text-gray-900 font-bold mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error || "Profile not found"}</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const { user: profileUser, is_mentor } = userProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profileUser.profile_picture ? (
                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  <img
                    src={profileUser.profile_picture}
                    alt={profileUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profileUser.first_name?.[0]?.toUpperCase()}
                  {profileUser.last_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileUser.first_name} {profileUser.last_name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">@{profileUser.username}</p>
              {profileUser.bio && (
                <p className="text-gray-700 mb-4">{profileUser.bio}</p>
              )}
              {is_mentor && (
                <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Mentor
                </span>
              )}
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Username</p>
              <p className="text-gray-900 font-medium">@{profileUser.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-gray-900 font-medium">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/settings">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Mentor Profile Section (if applicable) */}
        {is_mentor && mentorProfile && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentor Profile</h2>

            <div className="space-y-6">
              {/* Mentor Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {mentorProfile.mentor.title}
                  </h3>
                  {mentorProfile.mentor.bio && (
                    <p className="text-gray-700 mb-4">{mentorProfile.mentor.bio}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {mentorProfile.mentor.is_active ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Mentor Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Timezone</p>
                  <p className="text-gray-900 font-medium">{mentorProfile.mentor.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-gray-900 font-medium">
                    {mentorProfile.mentor.is_active ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Mentor Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
              <Link href="/mentor/services" className="flex-1">
                <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                  Manage Services
                </Button>
              </Link>
              <Link href="/mentor/availability" className="flex-1">
                <Button className="w-full bg-purple-500 text-white hover:bg-purple-600">
                  Manage Availability
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Create Mentor Profile CTA (if user is not a mentor) */}
        {!is_mentor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Become a Mentor</h3>
            <p className="text-blue-700 mb-4">
              Start sharing your expertise and help others grow. Create your mentor profile to get started.
            </p>
            <Link href="/mentor/create-profile">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Create Mentor Profile
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
