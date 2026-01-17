"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { bookingsApi, type MyBookingResponse } from "@/lib/api/bookings"
import { zeroApi } from "@/lib/api/zego"
import { useAuthStore } from "@/stores/auth.store"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const ZegoCallContainer = dynamic(() => import("@/components/zego/ZegoCallContainer"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      <p className="text-gray-400">Loading video call...</p>
    </div>
  ),
})

function VideoCallContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const bookingId = params?.bookingId as string

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<MyBookingResponse | null>(null)
  const [error, setError] = useState("")
  const [zegoToken, setZegoToken] = useState("")
  const [zegoAppId, setZegoAppId] = useState<number>(0)

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log("[SessionPage] Initializing...", { bookingId, userId: user?.id })
        setLoading(true)
        setError("")

        if (!bookingId || !user?.id || !user?.username) {
          throw new Error("Missing required information")
        }

        console.log("[SessionPage] Fetching bookings...")
        const bookings = await bookingsApi.getMyBookings()
        console.log("[SessionPage] Found bookings:", bookings.length)

        const selectedBooking = bookings.find((b) => b.id === bookingId)
        if (!selectedBooking) {
          throw new Error("Booking not found")
        }

        console.log("[SessionPage] Booking status:", selectedBooking.status)
        if (selectedBooking.status !== "confirmed") {
          throw new Error("Booking must be confirmed to join call")
        }

        console.log("[SessionPage] Generating Zego token...")
        const tokenResponse = await zeroApi.generateToken({
          userId: user.id,
          userName: user.username,
          roomId: bookingId,
          expirationSeconds: 3600,
        })

        console.log("[SessionPage] Full token response:", tokenResponse)
        console.log("[SessionPage] Token received, appId:", tokenResponse.appId, "token length:", tokenResponse.token?.length)
        
        if (!tokenResponse.appId) {
          console.error("[SessionPage] Missing appId in token response!")
          throw new Error("Invalid token response: missing appId")
        }
        
        setZegoToken(tokenResponse.token)
        setZegoAppId(tokenResponse.appId)
        setBooking(selectedBooking)
        setLoading(false)
        console.log("[SessionPage] Ready to join call with appId:", tokenResponse.appId)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load booking"
        console.error("[SessionPage] Error:", err)
        setError(message)
        setLoading(false)
        toast.error(message)
      }
    }

    initializeCall()
  }, [bookingId, user])

  const handleEndCall = () => {
    router.push("/bookings")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-white">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking || !zegoToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Navigation />
        <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-white font-bold mb-4">Unable to Join Call</h2>
          <p className="text-gray-300 mb-6">{error || "Failed to load booking"}</p>
          <Button
            onClick={() => router.push("/bookings")}
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-full mx-auto">
        {/* Video Call Container */}
        <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: "600px" }}>
          {zegoAppId && zegoToken && user && (
            <ZegoCallContainer
              appId={zegoAppId}
              token={zegoToken}
              userId={user.id}
              userName={user.username}
              roomId={bookingId}
              onLeaveRoom={handleEndCall}
            />
          )}
        </div>

        {/* Booking Info Below Video */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-white font-bold mb-6">Call Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Service</p>
              <p className="text-white font-semibold">{booking?.service}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">With</p>
              <p className="text-white font-semibold">{booking?.mentor}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Date</p>
              <p className="text-white font-semibold">{booking?.date}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Time</p>
              <p className="text-white font-semibold">
                {booking?.start_time} - {booking?.end_time}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-green-400 font-semibold">{booking?.status}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Amount</p>
              <p className="text-white font-semibold">
                {booking?.price_cents ? `₹${(booking.price_cents / 100).toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VideoCallPage() {
  return (
    <ProtectedRoute>
      <VideoCallContent />
    </ProtectedRoute>
  )
}
