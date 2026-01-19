"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { mentorApi } from "@/lib/api/mentor"
import { servicesApi } from "@/lib/api/services"
import { availabilityApi } from "@/lib/api/availability"
import { bookingsApi } from "@/lib/api/bookings"
import type { MentorProfileResponse } from "@/lib/api/mentor"
import type { MentorServiceResponse } from "@/lib/api/services"
import type { AvailableSlot } from "@/lib/api/availability"
import { formatPrice } from "@/lib/currencies"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth.store"

function BookingFlowContent() {
  const params = useParams()
  const router = useRouter()
  const username = params?.username as string
  const serviceId = params?.serviceId as string
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mentor, setMentor] = useState<MentorProfileResponse | null>(null)
  const [service, setService] = useState<MentorServiceResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState("")

  // Load mentor and service info
  useEffect(() => {
    if (!username || !serviceId) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const [mentorProfile, mentorServices] = await Promise.all([
          mentorApi.getProfile(username),
          servicesApi.getByUsername(username),
        ])

        setMentor(mentorProfile)
        const foundService = mentorServices.find((s) => s.id === serviceId)
        if (!foundService) {
          throw new Error("Service not found")
        }
        setService(foundService)
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load booking information"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [username, serviceId])

  // Fetch available slots when date is selected
  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setAvailableSlots([])

    if (!date || !username || !serviceId) return

    try {
      setLoadingSlots(true)
      const response = await availabilityApi.getAvailableSlots(username, {
        date,
        service_id: serviceId,
      })
      setAvailableSlots(response.slots)
      
      if (response.slots.length === 0) {
        toast.info("No available slots for this date")
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load available slots"
      toast.error(errorMessage)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !mentor || !service) {
      toast.error("Please select a date and time slot")
      return
    }

    // Prevent booking own service (mentor booking themselves)
    if (user?.username && user.username === mentor.user.username) {
      toast.error("You cannot book your own service")
      return
    }

    setSubmitting(true)

    try {
      const booking = await bookingsApi.create({
        mentor_id: mentor.mentor.id,
        service_id: service.id,
        booking_date: selectedDate,
        start_time: selectedSlot.start,
      })

      toast.success("Booking created! Redirecting to payment...")
      // Store booking ID in session storage for payment processing
      sessionStorage.setItem("pendingPaymentBookingId", booking.id)
      router.push("/bookings/payment")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create booking"
      toast.error(errorMessage)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Loading booking information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !mentor || !service) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Booking Information Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error || "The service or mentor you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push("/mentors")} variant="outline">
              Browse Mentors
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Book a Session</h1>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Mentor:</span>
              <p className="font-semibold text-gray-800">
                {mentor.user.first_name} {mentor.user.last_name} (@{mentor.user.username})
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Service:</span>
              <p className="font-semibold text-gray-800">{service.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-500">Duration:</span>
                <p className="font-semibold text-gray-800">{service.duration_minutes} minutes</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Price:</span>
                <p className="font-semibold text-gray-800">
                  {formatPrice(service.price_cents, service.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <FieldGroup className="gap-6">
            {/* Date Selection */}
            <Field>
              <FieldLabel className="text-gray-800">Select Date</FieldLabel>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                className="border-gray-300"
              />
              <FieldDescription>
                Choose a date for your session. Only future dates are available.
              </FieldDescription>
            </Field>

            {/* Available Slots */}
            {selectedDate && (
              <Field>
                <FieldLabel className="text-gray-800">Select Time</FieldLabel>
                {loadingSlots ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available slots for {formatDate(selectedDate)}</p>
                    <p className="text-sm mt-2">Please select a different date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={`${slot.start}-${index}`}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                          selectedSlot?.start === slot.start && selectedSlot?.end === slot.end
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                        }`}
                      >
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </button>
                    ))}
                  </div>
                )}
                <FieldDescription>
                  Select an available time slot for your session.
                </FieldDescription>
              </Field>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedSlot && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm text-orange-700">
                  <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                  <p><strong>Time:</strong> {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</p>
                  <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
                  <p><strong>Price:</strong> {formatPrice(service.price_cents, service.currency)}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedSlot || submitting || (user?.username === mentor.user.username)}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating Booking..." : "Confirm Booking"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/mentors/${username}`)}
                disabled={submitting}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>

            {user?.username === mentor.user.username && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                You cannot book your own service.
              </div>
            )}
          </FieldGroup>
        </div>
      </main>
    </div>
  )
}

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <BookingFlowContent />
    </ProtectedRoute>
  )
}
