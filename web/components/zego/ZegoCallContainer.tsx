"use client"

import React, { useEffect, useRef } from "react"

interface ZegoCallContainerProps {
  appId: number
  token: string
  userId: string
  userName?: string
  roomId: string
  onLeaveRoom: () => void
}

export default function ZegoCallContainer({
  appId,
  token,
  userId,
  userName,
  roomId,
  onLeaveRoom,
}: ZegoCallContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const componentRef = useRef<any>(null)
  const initializedRef = useRef<boolean>(false)

  useEffect(() => {
    console.log("[ZegoContainer] Component mounted with props:", {
      appId,
      hasToken: !!token,
      userId,
      userName,
      roomId,
    })

    if (!containerRef.current || !appId || !token || !userId || !roomId) {
      console.warn("[ZegoContainer] Missing required data for initialization")
      return
    }

    const initializeZego = async () => {
      if (initializedRef.current) {
        console.log("[ZegoContainer] Initialization skipped (already initialized)")
        return
      }
      try {
        console.log("[ZegoContainer] Starting Zego initialization...")

        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt")

        if (!ZegoUIKitPrebuilt) {
          throw new Error("ZegoUIKitPrebuilt not found in module")
        }

        console.log("[ZegoContainer] ZegoUIKitPrebuilt loaded successfully")
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
        let kitToken = token
        if (serverSecret) {
          try {
            kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
              appId,
              serverSecret,
              String(roomId),
              String(userId),
              String(userName || userId)
            )
            console.log("[ZegoContainer] Generated kitToken via client env secret")
          } catch (e) {
            console.warn("[ZegoContainer] Failed to generate kitToken locally, falling back to provided token", e)
          }
        } else {
          console.warn("[ZegoContainer] NEXT_PUBLIC_ZEGO_SERVER_SECRET missing; using provided token")
        }

        console.log("[ZegoContainer] Creating Zego instance with kitToken length:", kitToken?.length)

        // Create instance with kitToken and then join the room
        const zp = ZegoUIKitPrebuilt.create(kitToken)
        componentRef.current = zp

        // Ensure container is clean before joining
        try {
          containerRef.current!.innerHTML = ""
        } catch {}

        zp.joinRoom({
          container: containerRef.current!,
          sharedLinks: [
            {
              url: `${window.location.origin}${window.location.pathname}?roomID=${roomId}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          // Avoid auto-enabling devices to prevent NotReadableError
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: false,
          // Show controls so user can enable manually
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          onLeaveRoom: onLeaveRoom,
        })

        console.log("[ZegoContainer] Zego instance created and joined room successfully")
        initializedRef.current = true
      } catch (error) {
        console.error("[ZegoContainer] Initialization error:", error)
        if (error instanceof Error) {
          console.error("[ZegoContainer] Error message:", error.message)
          console.error("[ZegoContainer] Stack trace:", error.stack?.split("\n").slice(0, 10))
        }
      }
    }

    initializeZego()

    return () => {
      console.log("[ZegoContainer] Component cleanup")
      initializedRef.current = false
      try {
        if (componentRef.current) {
          if (typeof componentRef.current.destroy === "function") {
            componentRef.current.destroy()
          } else if (typeof componentRef.current.leaveRoom === "function") {
            componentRef.current.leaveRoom()
          }
        }
      } catch (e) {
        console.warn("[ZegoContainer] Error during instance cleanup:", e)
      }
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
        }
      } catch (e) {
        console.warn("[ZegoContainer] Error during container cleanup:", e)
      }
    }
  }, [appId, token, userId, userName, roomId, onLeaveRoom])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
      className="zego-container"
    />
  )
}
