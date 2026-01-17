"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/currencies"
import type { MyBookingResponse } from "@/lib/api/bookings"
import { Button } from "./button"
import { checkSessionJoinability, getTimeUntilSession } from "@/lib/utils/session-time"
import { toast } from "sonner"

interface BookingCardProps {
  booking: MyBookingResponse
  className?: string
}

/**
 * Booking Card Component
 * Displays booking information in a card format
 * Used in My Bookings page
 */
export function BookingCard({ booking, className = "" }: BookingCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if session can be joined (only for confirmed bookings)
  const sessionStatus = useMemo(() => {
    if (booking.status.toLowerCase() !== "confirmed") {
      return { canJoin: false, message: "", minutesUntilStart: 0 }
    }
    return checkSessionJoinability(booking.date, booking.start_time, booking.end_time)
  }, [booking])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      // Store booking ID in sessionStorage for payment page
      sessionStorage.setItem("pendingPaymentBookingId", booking.id)
      toast.success("Redirecting to payment...")
      router.push("/bookings/payment")
    } catch (err: any) {
      toast.error("Failed to process payment")
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {booking.service}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            with <span className="font-medium">{booking.mentor}</span>
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>{formatDate(booking.date)}</span>
            <span>
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            {formatPrice(booking.price_cents, booking.currency)}
          </p>
          
          {/* Payment Button for Pending Bookings */}
          {booking.status.toLowerCase() === "pending" && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          )}

          {/* Join Call Button for Confirmed Bookings */}
          {booking.status.toLowerCase() === "confirmed" && (
            <div>
              <Button
                onClick={() => router.push(`/session/${booking.id}`)}
                disabled={!sessionStatus.canJoin}
                className={`w-full ${
                  sessionStatus.canJoin
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
                title={sessionStatus.message}
              >
                {sessionStatus.canJoin ? "Join Call" : "Not Yet Available"}
              </Button>
              {!sessionStatus.canJoin && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {sessionStatus.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
