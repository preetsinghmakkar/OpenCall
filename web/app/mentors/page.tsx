"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MentorCard } from "@/components/ui/mentor-card"
import { mentorApi } from "@/lib/api/mentor"
import type { MentorProfileResponse } from "@/lib/api/mentor"
import { toast } from "sonner"

function MentorsBrowseContent() {
  const [searchUsername, setSearchUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [mentor, setMentor] = useState<MentorProfileResponse | null>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchUsername.trim()) {
      toast.error("Please enter a username")
      return
    }

    setLoading(true)
    setError("")
    setMentor(null)

    try {
      const mentorProfile = await mentorApi.getProfile(searchUsername.trim())
      setMentor(mentorProfile)
    } catch (err: any) {
      const errorMessage = err?.message || "Mentor not found"
      setError(errorMessage)
      setMentor(null)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Browse Mentors
          </h1>
          <p className="text-gray-600">
            Search for mentors by their username to view their profile and book sessions
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter mentor username (e.g., johndoe)"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Results */}
        {error && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Mentor Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <p className="text-sm text-gray-500">
                Make sure you entered the correct username and that the mentor has an active profile.
              </p>
            </div>
          </div>
        )}

        {mentor && (
          <div className="space-y-4">
            <MentorCard mentor={mentor} />
          </div>
        )}

        {!mentor && !error && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Find a Mentor
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a mentor's username above to view their profile and available services.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MentorsPage() {
  return <MentorsBrowseContent />
}
