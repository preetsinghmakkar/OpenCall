/**
 * Default interceptors for API client
 * These can be imported and set up in your app initialization
 */

import {
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  ApiError,
} from "./client"
import { toast } from "sonner"

/**
 * Setup default interceptors for development
 * Logs all requests, responses, and errors to console
 */
export function setupDevelopmentInterceptors() {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  // Request interceptor - log outgoing requests
  addRequestInterceptor((config) => {
    console.group(`🚀 API Request: ${config.method} ${config.url}`)
    console.log("Headers:", config.headers)
    if (config.body) {
      try {
        console.log("Body:", JSON.parse(config.body))
      } catch {
        console.log("Body:", config.body)
      }
    }
    console.groupEnd()
  })

  // Response interceptor - log successful responses
  addResponseInterceptor((response, data) => {
    console.group(`✅ API Response: ${response.status} ${response.statusText}`)
    console.log("Data:", data)
    console.groupEnd()
  })

  // Error interceptor - log errors
  addErrorInterceptor((error) => {
    console.group(`❌ API Error: ${error.status} ${error.message}`)
    console.error("Error details:", error.data)
    console.error("Stack:", error.stack)
    console.groupEnd()
    
    // Show toast for user-facing errors (skip 401 as it's handled by auth flow)
    if (error.status !== 401) {
      toast.error(error.message || "An error occurred")
    }
  })
}

/**
 * Setup production error interceptor
 * Can be used to send errors to error tracking service (e.g., Sentry)
 */
export function setupProductionErrorInterceptor() {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  addErrorInterceptor(async (error) => {
    // Only log critical errors (5xx) or authentication errors
    if (error.status >= 500 || error.status === 401) {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { extra: error.data })
      console.error("API Error:", error.message, error.data)
    }
    
    // Show toast for user-facing errors (skip 401 as it's handled by auth flow)
    if (error.status !== 401) {
      toast.error(error.message || "An error occurred")
    }
  })
}

/**
 * Setup all default interceptors
 * Call this in your app initialization (e.g., in layout.tsx or _app.tsx)
 */
export function setupDefaultInterceptors() {
  setupDevelopmentInterceptors()
  setupProductionErrorInterceptor()
}
