"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { ServiceCard } from "@/components/ui/service-card"
import { mentorApi } from "@/lib/api/mentor"
import { servicesApi } from "@/lib/api/services"
import type { MentorProfileResponse } from "@/lib/api/mentor"
import type { MentorServiceResponse } from "@/lib/api/services"
import { toast } from "sonner"

function MentorProfileContent() {
  const params = useParams()
  const username = params?.username as string

  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<MentorProfileResponse | null>(null)
  const [services, setServices] = useState<MentorServiceResponse[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!username) return

    const loadMentorProfile = async () => {
      try {
        setLoading(true)
        setError("")

        // Load mentor profile and services in parallel
        const [mentorProfile, mentorServices] = await Promise.all([
          mentorApi.getProfile(username),
          servicesApi.getByUsername(username).catch(() => []), // Return empty array if no services
        ])

        setMentor(mentorProfile)
        setServices(mentorServices)
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load mentor profile"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadMentorProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Loading mentor profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Mentor Not Found
            </h2>
            <p className="text-gray-600">{error || "The mentor profile you're looking for doesn't exist."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mentor Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
              {mentor.user.first_name[0]}
              {mentor.user.last_name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {mentor.user.first_name} {mentor.user.last_name}
              </h1>
              <p className="text-lg text-gray-500 mb-4">@{mentor.user.username}</p>

              {mentor.mentor.title && (
                <p className="text-xl font-semibold text-gray-700 mb-3">
                  {mentor.mentor.title}
                </p>
              )}

              {mentor.mentor.bio && (
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                  {mentor.mentor.bio}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Timezone: {mentor.mentor.timezone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Services</h2>

          {services.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Services Available
                </h3>
                <p className="text-gray-600">
                  This mentor hasn't set up any services yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  mentorUsername={mentor.user.username}
                  showBookButton={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function MentorProfilePage() {
  return <MentorProfileContent />
}
