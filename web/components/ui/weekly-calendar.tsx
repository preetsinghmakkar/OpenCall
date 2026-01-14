"use client"

import type { MentorAvailabilityResponse } from "@/lib/api/availability"

interface WeeklyCalendarProps {
  rules: MentorAvailabilityResponse[]
  className?: string
}

/**
 * Weekly Calendar Component
 * Displays availability rules in a weekly calendar format
 * Shows all rules grouped by day of week
 */
export function WeeklyCalendar({
  rules,
  className = "",
}: WeeklyCalendarProps) {
  const daysOfWeek = [
    { value: 0, label: "Sunday", short: "Sun" },
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
  ]

  const formatTime = (timeStr: string) => {
    // Convert "HH:MM" to "h:MM AM/PM"
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Group rules by day of week
  const rulesByDay = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.day_of_week]) {
        acc[rule.day_of_week] = []
      }
      acc[rule.day_of_week].push(rule)
      return acc
    },
    {} as Record<number, MentorAvailabilityResponse[]>
  )

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Weekly Availability
      </h3>

      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayRules = rulesByDay[day.value] || []

          return (
            <div
              key={day.value}
              className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-24 flex-shrink-0">
                  <p className="font-medium text-gray-800">{day.label}</p>
                </div>
                <div className="flex-1">
                  {dayRules.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Not available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dayRules.map((rule) => (
                        <span
                          key={rule.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700"
                        >
                          {formatTime(rule.start_time)} - {formatTime(rule.end_time)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No availability rules set yet.</p>
          <p className="text-sm mt-1">
            Add availability rules to allow others to book sessions with you.
          </p>
        </div>
      )}
    </div>
  )
}
