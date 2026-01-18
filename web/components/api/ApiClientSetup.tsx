"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { setupDefaultInterceptors } from "@/lib/api/interceptors"

/**
 * Component to set up API client interceptors and handle auth logout events
 * Should be included in the root layout
 */
export function ApiClientSetup() {
  const router = useRouter()
  const { logout, initializeFromLocalStorage, clearLocalOnly } = useAuthStore()

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initializeFromLocalStorage()

    // Set up default interceptors (logging, error tracking, etc.)
    setupDefaultInterceptors()

    // Listen for auth-logout events (dispatched when token refresh fails)
    const handleAuthLogout = () => {
      // Token refresh failed or auth cleared by API client — avoid calling
      // the full `logout` (which would call backend) to prevent loops.
      clearLocalOnly()
      router.push("/login")
    }

    window.addEventListener("auth-logout", handleAuthLogout)

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout)
    }
  }, [logout, router, initializeFromLocalStorage])

  return null // This component doesn't render anything
}
