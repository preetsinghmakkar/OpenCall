"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { servicesApi } from "@/lib/api/services"
import { currencies, getDefaultCurrency, dollarsToCents } from "@/lib/currencies"
import { useAuthStore } from "@/stores/auth.store"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"

function CreateServiceContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<{
    title?: string
    duration_minutes?: string
    price?: string
    currency?: string
  }>({})

  const defaultCurrency = getDefaultCurrency()
  const [pricePreview, setPricePreview] = useState(`${(0).toFixed(2)} ${defaultCurrency.code}`)
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency.code)

  // Update price preview
  useEffect(() => {
    const updatePricePreview = () => {
      const priceInput = document.getElementById("price") as HTMLInputElement
      const currencySelect = document.getElementById("currency") as HTMLSelectElement

      if (priceInput && currencySelect) {
        const price = parseFloat(priceInput.value) || 0
        const currency = currencySelect.value
        const currencyOption = currencies.find((c) => c.code === currency) || defaultCurrency

        if (price > 0) {
          setPricePreview(`${price.toFixed(2)} ${currencyOption.code}`)
        } else {
          setPricePreview(`0.00 ${currencyOption.code}`)
        }
        setSelectedCurrency(currency)
      }
    }

    // Listen for input changes
    const priceInput = document.getElementById("price")
    const currencySelect = document.getElementById("currency")

    if (priceInput) {
      priceInput.addEventListener("input", updatePricePreview)
    }
    if (currencySelect) {
      currencySelect.addEventListener("change", updatePricePreview)
    }

    return () => {
      if (priceInput) {
        priceInput.removeEventListener("input", updatePricePreview)
      }
      if (currencySelect) {
        currencySelect.removeEventListener("change", updatePricePreview)
      }
    }
  }, [defaultCurrency])

  // Check if user is a mentor
  useEffect(() => {
    if (!user?.username) return

    const checkMentorStatus = async () => {
      try {
        setCheckingMentor(true)
        const profile = await usersApi.getProfile(user.username)
        if (!profile.is_mentor) {
          router.push("/mentor/create-profile")
          return
        }
        setIsMentor(true)
      } catch (error) {
        console.error("Failed to check mentor status:", error)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkMentorStatus()
  }, [user?.username, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration_minutes") as string
    const price = formData.get("price") as string
    const currency = formData.get("currency") as string

    // Client-side validation
    const errors: {
      title?: string
      duration_minutes?: string
      price?: string
      currency?: string
    } = {}

    if (!title || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long"
    }

    if (!duration || duration !== "30") {
      errors.duration_minutes = "Duration must be 30 minutes"
    }

    if (!price) {
      errors.price = "Price is required"
    } else {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        errors.price = "Price must be a valid positive number"
      }
    }

    if (!currency || currency.length !== 3) {
      errors.currency = "Please select a valid currency"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)

    try {
      await servicesApi.create({
        title: title.trim(),
        description: description?.trim() || undefined,
        duration_minutes: 30,
        price_cents: dollarsToCents(parseFloat(price)),
        currency: currency.toUpperCase(),
      })

      // Success - show toast and redirect to services list
      toast.success("Service created successfully!")
      router.push("/mentor/services")
    } catch (err: any) {
      setError(err?.message || "Failed to create service")
      setLoading(false)
    }
  }

  if (checkingMentor) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600">Checking mentor status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isMentor) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create a Service
            </h1>
            <p className="text-gray-600">
              Define a service you'll offer to learners. You can create multiple
              services with different durations and prices.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              {/* Title Field */}
              <Field>
                <FieldLabel htmlFor="title" className="text-gray-800">
                  Service Title <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Code Review Session, Career Consultation, Technical Interview Prep"
                  required
                  minLength={3}
                  className="border-gray-300 placeholder:text-gray-400"
                  aria-invalid={formErrors.title ? "true" : "false"}
                />
                <FieldDescription className="text-gray-500">
                  A clear, descriptive title for your service (minimum 3
                  characters)
                </FieldDescription>
                {formErrors.title && (
                  <FieldError>{formErrors.title}</FieldError>
                )}
              </Field>

              {/* Description Field */}
              <Field>
                <FieldLabel htmlFor="description" className="text-gray-800">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe what learners can expect from this service, what topics you'll cover, and how you'll help them..."
                  className="border-gray-300 placeholder:text-gray-400"
                />
                <FieldDescription className="text-gray-500">
                  Optional: Provide details about what this service includes and
                  what learners will gain
                </FieldDescription>
              </Field>

              {/* Duration Field */}
              <Field>
                <FieldLabel htmlFor="duration_minutes" className="text-gray-800">
                  Session Duration <span className="text-red-500">*</span>
                </FieldLabel>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration_minutes"
                      value="30"
                      defaultChecked
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      aria-invalid={formErrors.duration_minutes ? "true" : "false"}
                    />
                    <span className="text-gray-700">30 minutes</span>
                  </label>
                </div>
                <FieldDescription className="text-gray-500">
                  Choose the duration for this service. Sessions are booked in
                  30-minute blocks.
                </FieldDescription>
                {formErrors.duration_minutes && (
                  <FieldError>{formErrors.duration_minutes}</FieldError>
                )}
              </Field>

              {/* Price and Currency Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Field */}
                <Field>
                  <FieldLabel htmlFor="price" className="text-gray-800">
                    Price <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      className="border-gray-300 placeholder:text-gray-400"
                      aria-invalid={formErrors.price ? "true" : "false"}
                    />
                  </div>
                  <FieldDescription className="text-gray-500">
                    Enter the price per session (in the selected currency)
                  </FieldDescription>
                  {formErrors.price && (
                    <FieldError>{formErrors.price}</FieldError>
                  )}
                </Field>

                {/* Currency Field */}
                <Field>
                  <FieldLabel htmlFor="currency" className="text-gray-800">
                    Currency <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Select
                    id="currency"
                    name="currency"
                    required
                    defaultValue={defaultCurrency.code}
                    className="border-gray-300"
                    aria-invalid={formErrors.currency ? "true" : "false"}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </Select>
                  <FieldDescription className="text-gray-500">
                    Select the currency for pricing this service
                  </FieldDescription>
                  {formErrors.currency && (
                    <FieldError>{formErrors.currency}</FieldError>
                  )}
                </Field>
              </div>

              {/* Price preview removed — not interactive or necessary */}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Service..." : "Create Service"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/mentor/services")}
                  disabled={loading}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </FieldGroup>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Tip:</strong> You can create multiple services with
              different durations and prices. After creating this service, you'll
              be able to set your availability rules.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreateServicePage() {
  return (
    <ProtectedRoute>
      <CreateServiceContent />
    </ProtectedRoute>
  )
}
