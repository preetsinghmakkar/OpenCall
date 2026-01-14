"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { BookingCard } from "@/components/ui/booking-card"
import { bookingsApi } from "@/lib/api/bookings"
import type { MyBookingResponse } from "@/lib/api/bookings"
import { toast } from "sonner"

type BookingStatus = "all" | "pending" | "confirmed" | "cancelled" | "completed"

function MyBookingsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<MyBookingResponse[]>([])
  const [filteredBookings, setFilteredBookings] = useState<MyBookingResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>("all")
  const [error, setError] = useState("")

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError("")
      const myBookings = await bookingsApi.getMyBookings()
      // Sort by date (most recent first)
      const sorted = myBookings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`)
        const dateB = new Date(`${b.date}T${b.start_time}`)
        return dateB.getTime() - dateA.getTime()
      })
      setBookings(sorted)
      setFilteredBookings(sorted)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load bookings"
      setError(errorMessage)
      toast.error(errorMessage)
      setBookings([])
      setFilteredBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  // Filter bookings by status
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredBookings(bookings)
    } else {
      const filtered = bookings.filter(
        (booking) => booking.status.toLowerCase() === selectedStatus
      )
      setFilteredBookings(filtered)
    }
  }, [selectedStatus, bookings])

  const statusFilters: { value: BookingStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
            <p className="text-gray-600">
              View and manage all your mentorship session bookings
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadBookings}
            disabled={loading}
            className="border-gray-300"
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Status Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label} ({filter.value === "all" ? bookings.length : bookings.filter(b => b.status.toLowerCase() === filter.value).length})
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Failed to Load Bookings
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={loadBookings}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Bookings Yet
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't booked any mentorship sessions yet. Browse mentors and book your first session!
              </p>
              <Link href="/mentors">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Browse Mentors
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Filtered Empty State */}
        {bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No {selectedStatus !== "all" ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : ""} Bookings
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have any {selectedStatus !== "all" ? selectedStatus : ""} bookings.
              </p>
              <Button
                onClick={() => setSelectedStatus("all")}
                variant="outline"
                className="border-gray-300"
              >
                View All Bookings
              </Button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function MyBookingsPage() {
  return (
    <ProtectedRoute>
      <MyBookingsContent />
    </ProtectedRoute>
  )
}
