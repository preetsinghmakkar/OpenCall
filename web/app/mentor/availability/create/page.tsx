"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { TimePicker } from "@/components/ui/time-picker"
import { availabilityApi } from "@/lib/api/availability"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"

function CreateAvailabilityContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<{
    day_of_week?: string
    start_time?: string
    end_time?: string
  }>({})

  const [dayOfWeek, setDayOfWeek] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")

  // Check if user is a mentor
  useEffect(() => {
    if (!user?.username) return

    const checkMentorStatus = async () => {
      try {
        setCheckingMentor(true)
        const profile = await usersApi.getProfile(user.username)
        if (!profile.is_mentor) {
          router.push("/mentor/create-profile")
          return
        }
        setIsMentor(true)
      } catch (error) {
        console.error("Failed to check mentor status:", error)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkMentorStatus()
  }, [user?.username, router])

  const validateTimeRange = (
    start: string,
    end: string
  ): { valid: boolean; error?: string } => {
    if (!start || !end) {
      return { valid: false, error: "Both start and end times are required" }
    }

    const [startHours, startMinutes] = start.split(":").map(Number)
    const [endHours, endMinutes] = end.split(":").map(Number)

    const startTotal = startHours * 60 + startMinutes
    const endTotal = endHours * 60 + endMinutes

    if (endTotal <= startTotal) {
      return {
        valid: false,
        error: "End time must be after start time",
      }
    }

    // Enforce minimum 30-minute availability window
    if (endTotal-startTotal < 30) {
      return {
        valid: false,
        error: "Minimum availability duration is 30 minutes",
      }
    }

    return { valid: true }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setFormErrors({})

    // Client-side validation
    const errors: {
      day_of_week?: string
      start_time?: string
      end_time?: string
    } = {}

    if (!dayOfWeek || dayOfWeek === "") {
      errors.day_of_week = "Please select a day of the week"
    } else {
      const dayNum = parseInt(dayOfWeek, 10)
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
        errors.day_of_week = "Invalid day of week"
      }
    }

    if (!startTime) {
      errors.start_time = "Start time is required"
    }

    if (!endTime) {
      errors.end_time = "End time is required"
    }

    // Validate time range
    if (startTime && endTime) {
      const timeValidation = validateTimeRange(startTime, endTime)
      if (!timeValidation.valid) {
        errors.end_time = timeValidation.error || "Invalid time range"
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)

    try {
      await availabilityApi.createRule({
        day_of_week: parseInt(dayOfWeek, 10),
        start_time: startTime,
        end_time: endTime,
      })

      toast.success("Availability rule created successfully!")
      router.push("/mentor/availability")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create availability rule"
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ]

  if (checkingMentor) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Checking mentor status...</p>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Availability Rule
            </h1>
            <p className="text-gray-600">
              Set when you're available for booking sessions. You can create
              multiple rules for different days and time ranges.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              {/* Day of Week Field */}
              <Field>
                <FieldLabel htmlFor="day_of_week" className="text-gray-800">
                  Day of Week <span className="text-red-500">*</span>
                </FieldLabel>
                <select
                  id="day_of_week"
                  name="day_of_week"
                  required
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="border-gray-300 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01IDZMMCAwSDEwTDUgNloiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat pr-10"
                  aria-invalid={formErrors.day_of_week ? "true" : "false"}
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <FieldDescription className="text-gray-500">
                  Select the day of the week when you're available
                </FieldDescription>
                {formErrors.day_of_week && (
                  <FieldError>{formErrors.day_of_week}</FieldError>
                )}
              </Field>

              {/* Time Range Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time Field */}
                <Field>
                  <FieldLabel htmlFor="start_time" className="text-gray-800">
                    Start Time <span className="text-red-500">*</span>
                  </FieldLabel>
                  <TimePicker
                    id="start_time"
                    name="start_time"
                    value={startTime}
                    onChange={setStartTime}
                    required
                    className="border-gray-300"
                    error={formErrors.start_time}
                    aria-invalid={formErrors.start_time ? "true" : "false"}
                  />
                  <FieldDescription className="text-gray-500">
                    When your availability starts (24-hour format)
                  </FieldDescription>
                </Field>

                {/* End Time Field */}
                <Field>
                  <FieldLabel htmlFor="end_time" className="text-gray-800">
                    End Time <span className="text-red-500">*</span>
                  </FieldLabel>
                  <TimePicker
                    id="end_time"
                    name="end_time"
                    value={endTime}
                    onChange={setEndTime}
                    required
                    min={startTime ? startTime : undefined}
                    className="border-gray-300"
                    error={formErrors.end_time}
                    aria-invalid={formErrors.end_time ? "true" : "false"}
                  />
                  <FieldDescription className="text-gray-500">
                    When your availability ends (24-hour format)
                  </FieldDescription>
                </Field>
              </div>

              {/* Time Range Preview */}
              {startTime && endTime && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-800 mb-1">
                    Availability Preview
                  </p>
                  <p className="text-sm text-orange-700">
                    You'll be available on{" "}
                    {daysOfWeek.find((d) => d.value === dayOfWeek)?.label || "selected day"}{" "}
                    from {startTime} to {endTime}
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Rule..." : "Create Rule"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/mentor/availability")}
                  disabled={loading}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </FieldGroup>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Tip:</strong> You can create multiple availability rules
              for the same day with different time ranges. For example, you could
              be available 9:00 AM - 12:00 PM and 2:00 PM - 5:00 PM on the same
              day.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreateAvailabilityPage() {
  return (
    <ProtectedRoute>
      <CreateAvailabilityContent />
    </ProtectedRoute>
  )
}
