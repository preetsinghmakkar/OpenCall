// lib/api/payments.ts

import { apiClient } from "./client"

/**
 * Matches backend CreatePaymentRequest
 */
export interface CreatePaymentRequest {
  booking_id: string // UUID, required
}

/**
 * Matches backend CreatePaymentResponse
 */
export interface CreatePaymentResponse {
  payment_id: string // UUID
  razorpay_order_id: string
  amount: number // in paise
  currency: string // "INR"
}

/**
 * Matches backend VerifyPaymentRequest
 */
export interface VerifyPaymentRequest {
  payment_id: string // UUID
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Razorpay order creation response (from backend)
 */
export interface RazorpayOrderResponse {
  id: string // Razorpay Order ID
  amount: number // in paise
  currency: string
  created_at: number // Unix timestamp
}

/**
 * Razorpay payment details (after successful payment)
 */
export interface RazorpayPaymentDetails {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  Created = "created",
  Paid = "paid",
  Failed = "failed",
}

/**
 * Payments API
 * Handles all payment-related operations
 */
export const paymentsApi = {
  /**
   * Create a payment order (protected)
   * POST /api/payments
   * 
   * Initiates a Razorpay order for a booking
   */
  createPayment(payload: CreatePaymentRequest) {
    return apiClient<CreatePaymentResponse, CreatePaymentRequest>(
      "/api/payments",
      {
        method: "POST",
        body: payload,
      }
    )
  },

  /**
   * Verify payment after successful capture (protected)
   * POST /api/payments/verify
   * 
   * Verifies the payment signature and marks payment as paid
   */
  verifyPayment(payload: VerifyPaymentRequest) {
    return apiClient<{ status: string }, VerifyPaymentRequest>(
      "/api/payments/verify",
      {
        method: "POST",
        body: payload,
      }
    )
  },
}
