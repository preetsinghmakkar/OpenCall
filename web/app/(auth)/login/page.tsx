"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginForm() {

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()

      const formData = new FormData(e.currentTarget)
      const identifier = formData.get("identifier")
      const password = formData.get("password")

      console.log({ identifier, password })
    }

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
              className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              Log in
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
