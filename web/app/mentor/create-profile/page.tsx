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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { mentorApi } from "@/lib/api/mentor"
import { timezones, getUserTimezone, getTimezonesByGroup } from "@/lib/timezones"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi } from "@/lib/api/users"

function CreateProfileContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<{
    title?: string
    timezone?: string
  }>({})

  // Check if user is already a mentor
  useEffect(() => {
    if (!user?.username) return

    const checkMentorStatus = async () => {
      try {
        setCheckingMentor(true)
        const profile = await usersApi.getProfile(user.username)
        if (profile.is_mentor) {
          setIsMentor(true)
          // Redirect to dashboard if already a mentor
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Failed to check mentor status:", error)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkMentorStatus()
  }, [user?.username, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const bio = formData.get("bio") as string
    const timezone = formData.get("timezone") as string

    // Client-side validation
    const errors: { title?: string; timezone?: string } = {}

    if (!title || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long"
    }

    if (!timezone) {
      errors.timezone = "Please select a timezone"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)

    try {
      await mentorApi.createProfile({
        title: title.trim(),
        bio: bio?.trim() || undefined,
        timezone,
      })

      // Success - redirect to services page or dashboard
      router.push("/mentor/services")
    } catch (err: any) {
      setError(err?.message || "Failed to create mentor profile")
      setLoading(false)
    }
  }

  const timezonesByGroup = getTimezonesByGroup()
  const defaultTimezone = getUserTimezone()

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

  if (isMentor) {
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
              Create Your Mentor Profile
            </h1>
            <p className="text-gray-600">
              Tell us about yourself and your expertise. This information will
              help learners find you.
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
              {/* Title Field */}
              <Field>
                <FieldLabel htmlFor="title" className="text-gray-800">
                  Professional Title <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Senior Software Engineer, UX Designer, Data Scientist"
                  required
                  minLength={3}
                  className="border-gray-300 placeholder:text-gray-400"
                  aria-invalid={formErrors.title ? "true" : "false"}
                />
                <FieldDescription className="text-gray-500">
                  A brief title that describes your expertise (minimum 3
                  characters)
                </FieldDescription>
                {formErrors.title && (
                  <FieldError>{formErrors.title}</FieldError>
                )}
              </Field>

              {/* Bio Field */}
              <Field>
                <FieldLabel htmlFor="bio" className="text-gray-800">
                  Bio
                </FieldLabel>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={6}
                  placeholder="Tell us about your background, experience, and what you can help others with..."
                  className="border-gray-300 placeholder:text-gray-400"
                />
                <FieldDescription className="text-gray-500">
                  Optional: Share more about yourself, your experience, and how
                  you can help others
                </FieldDescription>
              </Field>

              {/* Timezone Field */}
              <Field>
                <FieldLabel htmlFor="timezone" className="text-gray-800">
                  Timezone <span className="text-red-500">*</span>
                </FieldLabel>
                <Select
                  id="timezone"
                  name="timezone"
                  required
                  defaultValue={defaultTimezone}
                  className="border-gray-300"
                  aria-invalid={formErrors.timezone ? "true" : "false"}
                >
                  {Object.entries(timezonesByGroup).map(([group, tzs]) => (
                    <optgroup key={group} label={group}>
                      {tzs.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
                <FieldDescription className="text-gray-500">
                  Your timezone helps others know when you're available for
                  sessions
                </FieldDescription>
                {formErrors.timezone && (
                  <FieldError>{formErrors.timezone}</FieldError>
                )}
              </Field>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Profile..." : "Create Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
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
              <strong>Next steps:</strong> After creating your profile, you'll
              be able to add services and set your availability.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreateMentorProfilePage() {
  return (
    <ProtectedRoute>
      <CreateProfileContent />
    </ProtectedRoute>
  )
}
