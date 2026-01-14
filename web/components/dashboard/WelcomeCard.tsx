"use client"

import { useAuthStore } from "@/stores/auth.store"

interface WelcomeCardProps {
  isMentor: boolean
  mentorTitle?: string
}

export function WelcomeCard({ isMentor, mentorTitle }: WelcomeCardProps) {
  const { user } = useAuthStore()

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-orange-100 text-lg">
            {isMentor
              ? `You're mentoring as ${mentorTitle || "a mentor"}`
              : "Ready to share your expertise or learn from others?"}
          </p>
        </div>
        {user?.profile_picture ? (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user.profile_picture}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.[0]?.toUpperCase()}
            {user?.last_name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
