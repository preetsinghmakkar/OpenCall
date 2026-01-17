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

          // Force localStorage update immediately
          if (typeof window !== "undefined") {
            const stateToSave = {
              user: res.user,
              accessToken: res.access_token,
              refreshToken: res.refresh_token,
              expiresAt,
              isAuthenticated: true,
              loading: false,
              error: null,
            }
            localStorage.setItem("opencall-auth", JSON.stringify({ state: stateToSave, version: 0 }))
            console.log("[Auth Store] Token saved to localStorage:", { 
              hasToken: !!res.access_token, 
              username: res.user?.username 
            })
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
        if (!refreshToken) return

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
        } catch {
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
            localStorage.removeItem("opencall-auth")
            console.log("[Auth Store] Local state cleared")
          }
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
