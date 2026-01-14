"use client"

import Link from "next/link"
import { Button } from "./button"
import { formatPrice } from "@/lib/currencies"
import type { MentorServiceResponse } from "@/lib/api/services"

interface ServiceCardProps {
  service: MentorServiceResponse
  mentorUsername: string
  showBookButton?: boolean
  className?: string
}

/**
 * Service Card Component
 * Displays mentor service information in a card format
 * Used in mentor profile pages and service lists
 */
export function ServiceCard({
  service,
  mentorUsername,
  showBookButton = true,
  className = "",
}: ServiceCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {service.title}
          </h3>
          {service.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {service.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="font-medium">Duration:</span>
            <span>{service.duration_minutes} minutes</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Price:</span>
            <span className="font-semibold text-gray-800">
              {formatPrice(service.price_cents, service.currency)}
            </span>
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            service.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {service.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {showBookButton && service.is_active && (
        <Link href={`/book/${mentorUsername}/${service.id}`}>
          <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
            Book Now
          </Button>
        </Link>
      )}
    </div>
  )
}
