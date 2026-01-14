// lib/api/index.ts
// Central export file for all API modules

export * from "./auth"
export * from "./mentor"
export * from "./services"
export * from "./availability"
export * from "./bookings"
export * from "./users"
export * from "./client"

// Re-export commonly used types and functions
export { apiClient, ApiError } from "./client"
export { addRequestInterceptor, addResponseInterceptor, addErrorInterceptor } from "./client"
