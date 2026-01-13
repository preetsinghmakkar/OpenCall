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

          set({
            user: res.user,
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            expiresAt,
            isAuthenticated: true,
            loading: false,
          })
        } catch (err: any) {
          set({
            error: err?.message || "Login failed",
            loading: false,
            isAuthenticated: false,
          })
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

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        })
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
