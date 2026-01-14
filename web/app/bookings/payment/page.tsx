"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Navigation } from "@/components/layout/Navigation"
import { Button } from "@/components/ui/button"
import { paymentsApi, type CreatePaymentResponse } from "@/lib/api/payments"
import { bookingsApi, type MyBookingResponse } from "@/lib/api/bookings"
import { formatPrice } from "@/lib/currencies"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: any
  }
}

function PaymentFlowContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [booking, setBooking] = useState<MyBookingResponse | null>(null)
  const [paymentData, setPaymentData] = useState<CreatePaymentResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true)
        setError("")

        // Get the pending booking ID from session storage
        const bookingId = sessionStorage.getItem("pendingPaymentBookingId")
        if (!bookingId) {
          throw new Error("No booking found. Please create a booking first.")
        }

        // Fetch all bookings to find the one we just created
        const bookings = await bookingsApi.getMyBookings()
        const selectedBooking = bookings.find((b) => b.id === bookingId)
        
        if (!selectedBooking) {
          throw new Error("Booking not found. Please try again.")
        }

        setBooking(selectedBooking)

        // Create payment order
        const paymentResponse = await paymentsApi.createPayment({
          booking_id: bookingId,
        })

        setPaymentData(paymentResponse)

        // Load Razorpay script
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to initialize payment"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    initializePayment()

    return () => {
      // Cleanup session storage on unmount (unless payment succeeded)
      if (window.location.pathname === "/bookings/payment") {
        // Keep it during payment
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!paymentData || !booking) {
      toast.error("Payment data not loaded")
      return
    }

    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh and try again.")
      return
    }

    setProcessing(true)

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        order_id: paymentData.razorpay_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "OpenCall",
        description: `Booking: ${booking.service} with ${booking.mentor}`,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            await paymentsApi.verifyPayment({
              payment_id: paymentData.payment_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            // Clear session storage
            sessionStorage.removeItem("pendingPaymentBookingId")

            toast.success("Payment successful! Booking confirmed.")
            router.push("/bookings")
          } catch (verifyErr: any) {
            const errorMessage = verifyErr?.message || "Payment verification failed"
            toast.error(errorMessage)
            setProcessing(false)
          }
        },
        prefill: {
          name: "", // Could be filled with user data if available
          email: "",
          contact: "",
        },
        theme: {
          color: "#f97316", // orange-500
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to initiate payment"
      toast.error(errorMessage)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-gray-600 mt-4">Preparing payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Payment Setup Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/bookings")}
                variant="outline"
                className="w-full border-gray-300"
              >
                Back to Bookings
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h1>

          {booking && (
            <div className="mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Booking Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-800">{booking.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mentor:</span>
                    <span className="font-medium text-gray-800">{booking.mentor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-800">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-800">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between">
                    <span className="text-gray-700 font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formatPrice(booking.price_cents, booking.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Click the button below to proceed to secure payment via Razorpay.
                Your booking will be confirmed once payment is successful.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handlePayment}
                disabled={processing || !paymentData}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Proceed to Payment"}
              </Button>
              <Button
                onClick={() => router.push("/bookings")}
                variant="outline"
                disabled={processing}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Why do we charge?</h3>
          <p className="text-sm text-gray-600 mb-3">
            The payment secures your session slot. Once the mentor confirms the session completion,
            they receive payment to their account.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> You can cancel your booking up to 24 hours before the scheduled time
            to receive a full refund.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentFlowContent />
    </ProtectedRoute>
  )
}
