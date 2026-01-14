"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { servicesApi } from "@/lib/api/services"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi } from "@/lib/api/users"
import { formatPrice } from "@/lib/currencies"
import type { MentorServiceResponse } from "@/lib/api/services"

function ServicesListContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [services, setServices] = useState<MentorServiceResponse[]>([])

  const loadServices = async () => {
    if (!user?.username) return

    try {
      setLoading(true)
      const profile = await usersApi.getProfile(user.username)
      if (!profile.is_mentor) {
        router.push("/mentor/create-profile")
        return
      }
      setIsMentor(true)

      // Load services using getByUsername
      try {
        const mentorServices = await servicesApi.getByUsername(user.username)
        setServices(mentorServices)
      } catch (serviceError: any) {
        console.error("Failed to load services:", serviceError)
        // If services fail to load, still show the page (might be no services yet)
        setServices([])
      }
    } catch (error) {
      console.error("Failed to check mentor status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username])

  // Refresh services when window gains focus (e.g., after redirect from create page)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.username && isMentor) {
        loadServices()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username, isMentor])

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
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
              My Services
            </h1>
            <p className="text-gray-600">
              Manage the services you offer as a mentor
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => loadServices()}
              disabled={loading}
              className="border-gray-300"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Link href="/mentor/services/create">
              <Button className="bg-orange-500 text-white hover:bg-orange-600">
                + Add Service
              </Button>
            </Link>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Services Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first service to start offering mentorship sessions.
              </p>
              <Link href="/mentor/services/create">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Create Your First Service
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {service.title}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Duration: {service.duration_minutes} minutes</span>
                        <span>
                          Price: {formatPrice(service.price_cents, service.currency)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Next Steps
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Now that you have services set up, set your availability rules so
                others can book sessions with you.
              </p>
              <Link href="/mentor/availability">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Set Availability Rules
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <ProtectedRoute>
      <ServicesListContent />
    </ProtectedRoute>
  )
}
