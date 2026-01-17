"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/currencies"
import { Button } from "./button"
import { checkSessionJoinability } from "@/lib/utils/session-time"
import type { MentorBookedSessionResponse } from "@/lib/api/bookings"

interface MentorSessionCardProps {
  session: MentorBookedSessionResponse
  className?: string
}

/**
 * Mentor Session Card Component
 * Displays mentor's booked session with join call button
 */
export function MentorSessionCard({ session, className = "" }: MentorSessionCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if session can be joined
  const sessionStatus = useMemo(() => {
    return checkSessionJoinability(
      session.booking_date,
      session.start_time,
      session.end_time
    )
  }, [session])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00Z")
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleJoinCall = async () => {
    try {
      setIsProcessing(true)
      router.push(`/mentor/session/${session.id}`)
    } catch (err) {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {session.user_username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {session.user_username}
              </h3>
              <p className="text-sm text-gray-600">{session.service_title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <span>{formatDate(session.booking_date)}</span>
            <span>
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold text-gray-800 mb-4">
            {formatPrice(session.price_cents, session.currency)}
          </p>

          {/* Join Call Button */}
          <div>
            <Button
              onClick={handleJoinCall}
              disabled={!sessionStatus.canJoin || isProcessing}
              className={`w-full font-medium transition-colors ${
                sessionStatus.canJoin && !isProcessing
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
              title={sessionStatus.message}
            >
              {isProcessing ? "Joining..." : sessionStatus.canJoin ? "Join Call" : "Not Available"}
            </Button>
            {!sessionStatus.canJoin && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {sessionStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="pt-4 border-t border-gray-100">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Confirmed
        </span>
      </div>
    </div>
  )
}
