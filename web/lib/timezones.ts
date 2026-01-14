// lib/timezones.ts
// Common timezones for mentor profile selection

export interface TimezoneOption {
  value: string
  label: string
  group: string
}

export const timezones: TimezoneOption[] = [
  // Americas
  { value: "America/New_York", label: "Eastern Time (ET)", group: "Americas" },
  { value: "America/Chicago", label: "Central Time (CT)", group: "Americas" },
  { value: "America/Denver", label: "Mountain Time (MT)", group: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", group: "Americas" },
  { value: "America/Phoenix", label: "Arizona Time (MST)", group: "Americas" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", group: "Americas" },
  { value: "America/Toronto", label: "Toronto (ET)", group: "Americas" },
  { value: "America/Vancouver", label: "Vancouver (PT)", group: "Americas" },
  { value: "America/Mexico_City", label: "Mexico City (CST)", group: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", group: "Americas" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)", group: "Americas" },

  // Europe
  { value: "Europe/London", label: "London (GMT/BST)", group: "Europe" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", group: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", group: "Europe" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)", group: "Europe" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)", group: "Europe" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)", group: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)", group: "Europe" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)", group: "Europe" },
  { value: "Europe/Dublin", label: "Dublin (GMT/IST)", group: "Europe" },
  { value: "Europe/Athens", label: "Athens (EET/EEST)", group: "Europe" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", group: "Europe" },

  // Asia
  { value: "Asia/Dubai", label: "Dubai (GST)", group: "Asia" },
  { value: "Asia/Kolkata", label: "Mumbai/New Delhi (IST)", group: "Asia" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)", group: "Asia" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", group: "Asia" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", group: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", group: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", group: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", group: "Asia" },
  { value: "Asia/Seoul", label: "Seoul (KST)", group: "Asia" },
  { value: "Asia/Jakarta", label: "Jakarta (WIB)", group: "Asia" },
  { value: "Asia/Manila", label: "Manila (PHT)", group: "Asia" },

  // Oceania
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", group: "Oceania" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)", group: "Oceania" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)", group: "Oceania" },
  { value: "Australia/Perth", label: "Perth (AWST)", group: "Oceania" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", group: "Oceania" },

  // Africa
  { value: "Africa/Cairo", label: "Cairo (EET)", group: "Africa" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", group: "Africa" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", group: "Africa" },
  { value: "Africa/Nairobi", label: "Nairobi (EAT)", group: "Africa" },
]

/**
 * Get timezone by value
 */
export function getTimezone(value: string): TimezoneOption | undefined {
  return timezones.find((tz) => tz.value === value)
}

/**
 * Get timezones grouped by region
 */
export function getTimezonesByGroup(): Record<string, TimezoneOption[]> {
  return timezones.reduce((acc, tz) => {
    if (!acc[tz.group]) {
      acc[tz.group] = []
    }
    acc[tz.group].push(tz)
    return acc
  }, {} as Record<string, TimezoneOption[]>)
}

/**
 * Get user's timezone (browser default)
 */
export function getUserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return "America/New_York" // Default fallback
}
