"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { bookingsApi, type MentorBookedSessionResponse } from "@/lib/api/bookings"
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

function MentorVideoCallContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const bookingId = params?.bookingId as string

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<MentorBookedSessionResponse | null>(null)
  const [error, setError] = useState("")
  const [zegoToken, setZegoToken] = useState("")
  const [zegoAppId, setZegoAppId] = useState<number>(0)

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setLoading(true)
        setError("")

        if (!bookingId || !user?.id || !user?.username) {
          throw new Error("Missing required information")
        }

        // Get session details
        const sessions = await bookingsApi.getMentorBookedSessions()
        const selectedSession = sessions.find((s) => s.id === bookingId)

        if (!selectedSession) {
          throw new Error("Session not found")
        }

        // Get Zego token
        const tokenResponse = await zeroApi.generateToken({
          userId: user.id,
          userName: user.username,
          roomId: bookingId,
          expirationSeconds: 3600,
        })

        setZegoToken(tokenResponse.token)
        setZegoAppId(tokenResponse.appId)
        setSession(selectedSession)
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load session"
        setError(message)
        setLoading(false)
        toast.error(message)
      }
    }

    initializeCall()
  }, [bookingId, user])

  const handleEndCall = () => {
    router.push("/mentor/sessions")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-white">Loading session details...</p>
        </div>
      </div>
    )
  }

  if (error || !session || !zegoToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Navigation />
        <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-white font-bold mb-4">Unable to Join Call</h2>
          <p className="text-gray-300 mb-6">{error || "Failed to load session"}</p>
          <Button
            onClick={() => router.push("/mentor/sessions")}
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Back to Sessions
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

        {/* Session Info Below Video */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-white font-bold mb-6">Session Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Client</p>
              <p className="text-white font-semibold">{session?.user_username}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Service</p>
              <p className="text-white font-semibold">{session?.service_title}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Date</p>
              <p className="text-white font-semibold">{session?.booking_date}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Time</p>
              <p className="text-white font-semibold">
                {session?.start_time} - {session?.end_time}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Amount</p>
              <p className="text-white font-semibold">
                {session?.price_cents ? `₹${(session.price_cents / 100).toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function MentorVideoCallPage() {
  return (
    <ProtectedRoute>
      <MentorVideoCallContent />
    </ProtectedRoute>
  )
}
