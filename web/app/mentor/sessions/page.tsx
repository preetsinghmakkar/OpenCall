"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { bookingsApi, type MentorBookedSessionResponse } from "@/lib/api/bookings"
import { formatPrice } from "@/lib/currencies"
import { toast } from "sonner"

function MentorSessionsContent() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<MentorBookedSessionResponse[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await bookingsApi.getMentorBookedSessions()
        setSessions(data)

        if (data.length === 0) {
          toast.info("No booked sessions yet")
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load booked sessions"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00Z")
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading your booked sessions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Error Loading Sessions
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Booked Sessions
          </h1>
          <p className="text-gray-600">
            Confirmed bookings from clients
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Booked Sessions
            </h2>
            <p className="text-gray-600">
              You don't have any confirmed bookings yet. Share your profile to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Client & Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                        {session.user_username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {session.user_username}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {session.service_title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center: Date & Time */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {formatDate(session.booking_date)}
                    </p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatPrice(session.price_cents, session.currency)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {sessions.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {sessions.length}
              </div>
              <p className="text-gray-600 text-sm">Total Booked Sessions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatPrice(
                  sessions.reduce((sum, s) => sum + s.price_cents, 0),
                  sessions[0]?.currency || "INR"
                )}
              </div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {new Set(sessions.map((s) => s.user_username)).size}
              </div>
              <p className="text-gray-600 text-sm">Unique Clients</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MentorSessionsPage() {
  return (
    <ProtectedRoute>
      <MentorSessionsContent />
    </ProtectedRoute>
  )
}
