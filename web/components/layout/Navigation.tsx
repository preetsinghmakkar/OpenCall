"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-2xl font-semibold text-gray-800 hover:text-orange-500 transition-colors"
            >
              <span className="text-orange-500">OpenCall</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/bookings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/bookings")
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Bookings
              </Link>
              <Link
                href="/mentors"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/mentors")
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Browse Mentors
              </Link>
              <Link
                href="/mentor/sessions"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/mentor/sessions")
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Sessions
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
              {user?.profile_picture ? (
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                  {user.profile_picture}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.[0]?.toUpperCase()}
                  {user?.last_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
