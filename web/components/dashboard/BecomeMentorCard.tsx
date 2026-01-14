"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BecomeMentorCardProps {
  isMentor: boolean
  onBecomeMentor: () => void
}

export function BecomeMentorCard({
  isMentor,
  onBecomeMentor,
}: BecomeMentorCardProps) {
  const router = useRouter()

  if (isMentor) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              You're a Mentor!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your mentor profile, services, and availability from your
              mentor dashboard.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/mentor/profile")}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Manage Profile
              </Button>
              <Button
                onClick={() => router.push("/mentor/services")}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Manage Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-orange-50 border-orange-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          🎓
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Become a Mentor
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Share your expertise and help others grow. Create your mentor profile
            to start offering services and connect with learners.
          </p>
          <Button
            onClick={onBecomeMentor}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Get Started as a Mentor
          </Button>
        </div>
      </div>
    </div>
  )
}
