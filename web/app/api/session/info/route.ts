import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("booking_id")
    const timezone = searchParams.get("timezone")
    const role = searchParams.get("role") || "user"

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing booking_id" },
        { status: 400 }
      )
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Call backend to validate session
    const response = await fetch(
      `${BACKEND_URL}/api/session/info?booking_id=${bookingId}&timezone=${encodeURIComponent(
        timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      )}&role=${role}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[Session API Error]", error)
    return NextResponse.json(
      { error: "Failed to get session info", message: error?.message },
      { status: 500 }
    )
  }
}
