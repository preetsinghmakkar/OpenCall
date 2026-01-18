import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authApi, LoginRequest, LoginResponse } from "@/lib/api/auth"

interface AuthState {
  user: LoginResponse["user"] | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null

  isAuthenticated: boolean
  loading: boolean
  error: string | null

  login: (payload: LoginRequest) => Promise<void>
  refresh: () => Promise<void>
  logout: () => void
  clearLocalOnly: () => void
  initializeFromLocalStorage: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,

      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (payload) => {
        try {
          set({ loading: true, error: null })

          const res = await authApi.login(payload)

          const expiresAt =
            Date.now() + res.expires_in * 1000

          // Validate response tokens
          if (!res.access_token || !res.refresh_token) {
            throw new Error("Invalid login response: missing tokens")
          }

          // Explicitly set the state
          set({
            user: res.user,
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            expiresAt,
            isAuthenticated: true,
            loading: false,
            error: null,
          })

          // Force localStorage update immediately with proper formatting
          if (typeof window !== "undefined") {
            const stateToSave = {
              user: res.user,
              accessToken: res.access_token,
              refreshToken: res.refresh_token,
              expiresAt,
              isAuthenticated: true,
            }
            // Store with the Zustand persist middleware format
            const storageData = {
              state: stateToSave,
              version: 0,
            }
            localStorage.setItem("opencall-auth", JSON.stringify(storageData))
            console.log("[Auth Store] Login successful - tokens saved to localStorage:", { 
              hasAccessToken: !!res.access_token, 
              hasRefreshToken: !!res.refresh_token,
              username: res.user?.username 
            })
            
            // Verify tokens were actually saved
            const saved = localStorage.getItem("opencall-auth")
            if (!saved) {
              throw new Error("Failed to persist tokens to localStorage")
            }
            const savedParsed = JSON.parse(saved)
            if (!savedParsed.state?.accessToken || !savedParsed.state?.refreshToken) {
              throw new Error("Tokens not properly persisted to localStorage")
            }
          }
        } catch (err: any) {
          console.error("[Auth Store] Login error:", err)
          set({
            error: err?.message || "Login failed",
            loading: false,
            isAuthenticated: false,
          })
          throw err
        }
      },

      refresh: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          console.warn("[Auth Store] No refresh token available")
          return
        }

        try {
          const res = await authApi.refresh(refreshToken)

          const expiresAt =
            Date.now() + res.expires_in * 1000

          set({
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            expiresAt,
            isAuthenticated: true,
          })
          
          console.log("[Auth Store] Token refreshed successfully")
        } catch (error) {
          console.error("[Auth Store] Token refresh failed, logging out:", error)
          // Refresh failed → force logout
          get().logout()
        }
      },

      logout: async () => {
        try {
          // Call backend logout endpoint to revoke all refresh tokens
          await authApi.logout()
          console.log("[Auth Store] Backend logout successful")
        } catch (err) {
          // Even if backend call fails, clear local state for security
          console.warn("[Auth Store] Backend logout failed, clearing local state:", err)
        } finally {
          // Always clear local state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          })
          if (typeof window !== "undefined") {
            // Complete cleanup: remove from localStorage and dispatch event
            localStorage.removeItem("opencall-auth")
            console.log("[Auth Store] Local state cleared and logout event dispatched")
          }
        }
      },

      // Clear local auth state only (no backend call, no event dispatch)
      clearLocalOnly: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        })
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("opencall-auth")
          } catch {}
          console.log("[Auth Store] Local auth state cleared (no backend call)")
        }
      },

      initializeFromLocalStorage: () => {
        if (typeof window === "undefined") return
        
        try {
          const stored = localStorage.getItem("opencall-auth")
          if (stored) {
            const parsed = JSON.parse(stored)
            const state = parsed.state || parsed
            console.log("[Auth Store] Hydrating from localStorage:", { 
              hasToken: !!state.accessToken,
              username: state.user?.username 
            })
            set({
              user: state.user || null,
              accessToken: state.accessToken || null,
              refreshToken: state.refreshToken || null,
              expiresAt: state.expiresAt || null,
              isAuthenticated: state.isAuthenticated || false,
            })
          }
        } catch (err) {
          console.error("[Auth Store] Failed to hydrate from localStorage:", err)
        }
      },
    }),
    {
      name: "opencall-auth", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
