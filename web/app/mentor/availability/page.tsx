"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { WeeklyCalendar } from "@/components/ui/weekly-calendar"
import { availabilityApi } from "@/lib/api/availability"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi } from "@/lib/api/users"
import type { MentorAvailabilityResponse } from "@/lib/api/availability"
import { toast } from "sonner"

function AvailabilityListContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [rules, setRules] = useState<MentorAvailabilityResponse[]>([])

  useEffect(() => {
    if (!user?.username) return

    const checkMentorAndLoadRules = async () => {
      try {
        setLoading(true)
        const profile = await usersApi.getProfile(user.username)
        if (!profile.is_mentor) {
          router.push("/mentor/create-profile")
          return
        }
        setIsMentor(true)

        // Load availability rules
        const availabilityRules = await availabilityApi.getRulesByUsername(
          user.username
        )
        setRules(availabilityRules)
      } catch (error: any) {
        console.error("Failed to load availability rules:", error)
        toast.error("Failed to load availability rules")
      } finally {
        setLoading(false)
      }
    }

    checkMentorAndLoadRules()
  }, [user?.username, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Loading availability rules...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isMentor) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Availability
            </h1>
            <p className="text-gray-600">
              Manage when you're available for booking sessions
            </p>
          </div>
          <Link href="/mentor/availability/create">
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              + Add Availability Rule
            </Button>
          </Link>
        </div>

        <WeeklyCalendar rules={rules} />

        {rules.length === 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Availability Rules Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Set your availability to allow others to book sessions with you.
                You can create multiple rules for different days and time ranges.
              </p>
              <Link href="/mentor/availability/create">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Create Your First Availability Rule
                </Button>
              </Link>
            </div>
          </div>
        )}

        {rules.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="flex gap-4">
              <Link href="/mentor/availability/create">
                <Button variant="outline" className="border-gray-300">
                  Add Another Rule
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-300">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AvailabilityPage() {
  return (
    <ProtectedRoute>
      <AvailabilityListContent />
    </ProtectedRoute>
  )
}
