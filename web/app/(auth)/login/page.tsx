"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth.store"

export default function LoginForm() {
  const router = useRouter()
  const { login, loading, error, isAuthenticated } = useAuthStore()
  const [localError, setLocalError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)

    const formData = new FormData(e.currentTarget)
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string

    if (!identifier || !password) {
      setLocalError("Please fill in all fields")
      return
    }

    try {
      await login({ identifier, password })
      // Redirect is handled by useEffect when isAuthenticated becomes true
      router.push("/dashboard")
    } catch (err: any) {
      setLocalError(err?.message || "Login failed")
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back to 
            <span className="text-orange-500"> OpenCall</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Please sign in to your account
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700 text-sm">
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-5">
            {/* identifier */}
            <Field>
              <FieldLabel htmlFor="identifier" className="text-gray-800">
                Username or Email
              </FieldLabel>
              <Input
                id="identifier"
                name="identifier"
                type="identifier"
                placeholder="username or you@example.com"
                required
                className="border-gray-300 placeholder:text-gray-500"
              />
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password" className="text-gray-800">
                Password
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                className="border-gray-300 placeholder:text-gray-500"
              />
              <FieldDescription className="text-gray-500">
                Must be at least 8 characters
              </FieldDescription>
            </Field>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            {/* Link to Register */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up
              </a>
            </p>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
