"use client"

import Link from "next/link"
import { Button } from "./button"
import type { MentorProfileResponse } from "@/lib/api/mentor"

interface MentorCardProps {
  mentor: MentorProfileResponse
  className?: string
}

/**
 * Mentor Card Component
 * Displays mentor information in a card format
 * Used in mentor browsing/list pages
 */
export function MentorCard({ mentor, className = "" }: MentorCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
              {mentor.user.first_name[0]}
              {mentor.user.last_name[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {mentor.user.first_name} {mentor.user.last_name}
              </h3>
              <p className="text-sm text-gray-500">@{mentor.user.username}</p>
            </div>
          </div>

          {mentor.mentor.title && (
            <p className="text-base font-medium text-gray-700 mb-2">
              {mentor.mentor.title}
            </p>
          )}

          {mentor.mentor.bio && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {mentor.mentor.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Timezone: {mentor.mentor.timezone}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link href={`/mentors/${mentor.user.username}`}>
          <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
