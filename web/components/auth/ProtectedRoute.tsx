"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component
 * - Redirects unauthenticated users to login
 * - Checks token expiry and attempts refresh
 * - Only renders children if user is authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, accessToken, refresh, expiresAt } = useAuthStore()

  useEffect(() => {
    // Check if token is expired or about to expire
    if (accessToken && expiresAt) {
      const timeUntilExpiry = expiresAt - Date.now()
      // Refresh if less than 5 minutes remaining
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refresh()
      }
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router, accessToken, expiresAt, refresh])

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
