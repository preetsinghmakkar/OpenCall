import { apiClient } from "./client"

export interface GenerateTokenRequest {
  userId: string
  userName: string
  roomId: string
  expirationSeconds?: number
}

// This matches what the backend sends (snake_case)
interface GenerateTokenResponseRaw {
  token: string
  app_id: number
  room_id: string
  user_id: string
}

// This is what we expose (camelCase)
export interface GenerateTokenResponse {
  token: string
  appId: number
  roomId: string
  userId: string
}

export interface SessionInfoResponse {
  appId: number
  roomId: string
  userId: string
  userName: string
}

export const zeroApi = {
  async generateToken(request: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    console.log("[ZegoAPI] Calling generateToken for room:", request.roomId)
    try {
      const response = await apiClient<any>(
        "/api/zego/token",
        {
          method: "POST",
          body: {
            user_id: request.userId,
            user_name: request.userName,
            room_id: request.roomId,
            expiration_seconds: request.expirationSeconds || 3600,
          },
        }
      )
      console.log("[ZegoAPI] Raw response:", response)
      
      // Convert snake_case to camelCase
      const typedResponse: GenerateTokenResponse = {
        token: response.token,
        appId: response.app_id || response.appId,
        roomId: response.room_id || response.roomId,
        userId: response.user_id || response.userId,
      }
      
      console.log("[ZegoAPI] Typed response:", typedResponse)
      console.log("[ZegoAPI] Token received, length:", typedResponse.token?.length, "appId:", typedResponse.appId)
      return typedResponse
    } catch (error) {
      console.error("[ZegoAPI] generateToken failed:", error)
      throw error
    }
  },

  async getSessionInfo(bookingId: string): Promise<SessionInfoResponse> {
    console.log("[ZegoAPI] Calling getSessionInfo for booking:", bookingId)
    try {
      const response = await apiClient<SessionInfoResponse>(
        `/api/zego/session/${bookingId}`,
        {
          method: "GET",
        }
      )
      console.log("[ZegoAPI] Session info received")
      return response
    } catch (error) {
      console.error("[ZegoAPI] getSessionInfo failed:", error)
      throw error
    }
  },
}
