"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-orange-500">OpenCall</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with mentors and book sessions to grow your skills
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 text-lg">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-gray-300"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 
