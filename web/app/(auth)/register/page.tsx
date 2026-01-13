"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    }

    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Registration failed")
        setLoading(false)
        return
      }

      // success → redirect to login
      router.push("/auth/login")
    } catch (err) {
      console.error(err)
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome To <span className="text-orange-500">OpenCall</span></h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign up to get started
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister}>
          <FieldGroup className="gap-5">
            {/* First Name */}
            <Field>
              <FieldLabel htmlFor="first_name" className="text-gray-800">
                First Name
              </FieldLabel>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="John"
                required
                className="border-gray-300 placeholder:text-gray-500"
              />
            </Field>

            {/* Last Name */}
            <Field>
              <FieldLabel htmlFor="last_name" className="text-gray-800">
                Last Name
              </FieldLabel>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Doe"
                required
                className="border-gray-300 placeholder:text-gray-500"
              />
            </Field>

            {/* Username */}
            <Field>
              <FieldLabel htmlFor="username" className="text-gray-800">
                Username
              </FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                className="border-gray-300 placeholder:text-gray-500"
              />
              <FieldDescription className="text-gray-500">
                Choose a unique username
              </FieldDescription>
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email" className="text-gray-800">
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
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
                placeholder="••••••••"
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
              className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
