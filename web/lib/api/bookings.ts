// lib/api/bookings.ts

import { apiClient } from "./client"

/**
 * Matches backend CreateBookingRequest
 */
export interface CreateBookingRequest {
  mentor_id: string // UUID, required
  service_id: string // UUID, required
  booking_date: string // format "YYYY-MM-DD", required
  start_time: string // format "HH:MM", required
}

/**
 * Matches backend BookingResponse
 */
export interface BookingResponse {
  id: string
  status: string // "pending" | "confirmed" | "cancelled" | "completed"
  date: string // format "YYYY-MM-DD"
  start_time: string // format "HH:MM"
  end_time: string // format "HH:MM"
  price_cents: number
  currency: string
}

/**
 * Matches backend MyBookingResponse
 */
export interface MyBookingResponse {
  id: string
  mentor: string // username
  service: string // service title
  date: string // format "YYYY-MM-DD"
  start_time: string // format "HH:MM"
  end_time: string // format "HH:MM"
  status: string // "pending" | "confirmed" | "cancelled" | "completed"
  price_cents: number
  currency: string
}

export const bookingsApi = {
  /**
   * Create a booking (protected)
   * POST /api/bookings
   */
  create(payload: CreateBookingRequest) {
    return apiClient<BookingResponse, CreateBookingRequest>("/api/bookings", {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Get current user's bookings (protected)
   * GET /api/bookings/me
   */
  getMyBookings() {
    return apiClient<MyBookingResponse[]>("/api/bookings/me", {
      method: "GET",
    })
  },
}
