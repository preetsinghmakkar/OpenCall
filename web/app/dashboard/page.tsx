"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { WelcomeCard } from "@/components/dashboard/WelcomeCard"
import { BecomeMentorCard } from "@/components/dashboard/BecomeMentorCard"
import { usersApi } from "@/lib/api/users"
import { bookingsApi } from "@/lib/api/bookings"
import type { UserProfileResponse, MyBookingResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function DashboardContent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isMentor, setIsMentor] = useState(false)
  const [mentorTitle, setMentorTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState<MyBookingResponse[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  // Check if user is a mentor
  useEffect(() => {
    if (!user?.username) return

    const checkMentorStatus = async () => {
      try {
        setLoading(true)
        const profile = await usersApi.getProfile(user.username)
        setIsMentor(profile.is_mentor)
        setMentorTitle(profile.mentor?.title || null)
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        setIsMentor(false)
      } finally {
        setLoading(false)
      }
    }

    checkMentorStatus()
  }, [user?.username])

  // Fetch recent bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true)
        const bookings = await bookingsApi.getMyBookings()
        // Get up to 3 most recent bookings
        const sorted = bookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start_time}`)
          const dateB = new Date(`${b.date}T${b.start_time}`)
          return dateB.getTime() - dateA.getTime()
        })
        setRecentBookings(sorted.slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleBecomeMentor = () => {
    router.push("/mentor/create-profile")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    // Convert "HH:MM" to "h:MM AM/PM"
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          {!loading && (
            <WelcomeCard isMentor={isMentor} mentorTitle={mentorTitle || undefined} />
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Profile
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  @{user?.username}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <Link
                  href="/profile"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  View Profile →
                </Link>
              </div>
            </div>

            {/* Bookings Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total Bookings
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {bookingsLoading ? "..." : recentBookings.length}
              </p>
              <Link
                href="/bookings"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium mt-2 inline-block"
              >
                View All →
              </Link>
            </div>

            {/* Mentor Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Mentor Status
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {loading ? (
                  "..."
                ) : isMentor ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-gray-400">Not a Mentor</span>
                )}
              </p>
              {isMentor && (
                <Link
                  href="/mentor/profile"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium mt-2 inline-block"
                >
                  Manage →
                </Link>
              )}
            </div>
          </div>

          {/* Become a Mentor Card */}
          {!loading && (
            <BecomeMentorCard
              isMentor={isMentor}
              onBecomeMentor={handleBecomeMentor}
            />
          )}

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Bookings
              </h3>
              <Link
                href="/bookings"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                View All →
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading bookings...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You don't have any bookings yet.
                </p>
                <Link href="/mentors">
                  <Button className="bg-orange-500 text-white hover:bg-orange-600">
                    Browse Mentors
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {booking.service}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          with {booking.mentor}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.date)} at {formatTime(booking.start_time)} -{" "}
                          {formatTime(booking.end_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ${(booking.price_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{booking.currency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/mentors">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <span className="text-lg mr-2">🔍</span>
                  <div className="text-left">
                    <div className="font-medium">Browse Mentors</div>
                    <div className="text-xs text-gray-500">Find mentors</div>
                  </div>
                </Button>
              </Link>
              <Link href="/bookings">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <span className="text-lg mr-2">📅</span>
                  <div className="text-left">
                    <div className="font-medium">My Bookings</div>
                    <div className="text-xs text-gray-500">View all</div>
                  </div>
                </Button>
              </Link>
              {isMentor ? (
                <Link href="/mentor/services">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                  >
                    <span className="text-lg mr-2">⚙️</span>
                    <div className="text-left">
                      <div className="font-medium">Services</div>
                      <div className="text-xs text-gray-500">Manage</div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleBecomeMentor}
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <span className="text-lg mr-2">🎓</span>
                  <div className="text-left">
                    <div className="font-medium">Become Mentor</div>
                    <div className="text-xs text-gray-500">Get started</div>
                  </div>
                </Button>
              )}
              <Link href={`/users/${user?.username}`}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <span className="text-lg mr-2">👤</span>
                  <div className="text-left">
                    <div className="font-medium">Profile</div>
                    <div className="text-xs text-gray-500">View/edit</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
