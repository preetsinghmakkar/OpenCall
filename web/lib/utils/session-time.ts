// lib/utils/session-time.ts

/**
 * Check if a session can be joined based on current time
 * Returns: { canJoin, message, minutesUntilStart }
 */
export function checkSessionJoinability(
  date: string,
  startTime: string,
  endTime: string,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): {
  canJoin: boolean
  message: string
  minutesUntilStart: number
} {
  try {
    // Parse the date and time
    const [year, month, day] = date.split("-").map(Number)
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    // Create start and end times in UTC (assuming booking times are in user's timezone)
    const startDateTime = new Date(year, month - 1, day, startHours, startMinutes, 0)
    const endDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0)

    // Get current time
    const now = new Date()

    // Calculate time until start
    const minutesUntilStart = Math.floor(
      (startDateTime.getTime() - now.getTime()) / (1000 * 60)
    )

    // Session can be joined 5 minutes before start and until end time
    const canJoinStartTime = new Date(startDateTime.getTime() - 5 * 60 * 1000)
    const canJoinEndTime = endDateTime

    if (now < canJoinStartTime) {
      return {
        canJoin: false,
        message: `Session starts at ${startTime}. Join available ${minutesUntilStart > 5 ? minutesUntilStart - 5 : 0} minutes before.`,
        minutesUntilStart,
      }
    }

    if (now > canJoinEndTime) {
      return {
        canJoin: false,
        message: "Session time has ended",
        minutesUntilStart: -1,
      }
    }

    return {
      canJoin: true,
      message: "You can join now",
      minutesUntilStart,
    }
  } catch (error) {
    return {
      canJoin: false,
      message: "Unable to determine session time",
      minutesUntilStart: 0,
    }
  }
}

/**
 * Get time remaining until session
 */
export function getTimeUntilSession(
  date: string,
  startTime: string
): string {
  try {
    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = startTime.split(":").map(Number)

    const startDateTime = new Date(year, month - 1, day, hours, minutes, 0)
    const now = new Date()

    const diff = startDateTime.getTime() - now.getTime()

    if (diff <= 0) {
      return "Session time has arrived"
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hrs}h away`
    } else if (hrs > 0) {
      return `${hrs}h ${mins}m away`
    } else {
      return `${mins}m away`
    }
  } catch (error) {
    return "Unknown"
  }
}
