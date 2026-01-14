"use client"

import { Toaster } from "sonner"

/**
 * Toast Provider Component
 * Wraps the Sonner Toaster component for global toast notifications
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  )
}
