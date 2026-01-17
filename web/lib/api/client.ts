const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface RequestOptions<TBody> {
  method?: HTTPMethod
  body?: TBody
  token?: string
  headers?: Record<string, string>
  skipAuth?: boolean // Skip automatic token injection
  timeout?: number // Request timeout in milliseconds (default: 30000)
  skipContentType?: boolean // Skip setting Content-Type header (useful for FormData)
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Request interceptor type
 */
type RequestInterceptor = (config: {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}) => void | Promise<void>

/**
 * Response interceptor type
 */
type ResponseInterceptor = (response: Response, data: any) => void | Promise<void>

/**
 * Error interceptor type
 */
type ErrorInterceptor = (error: ApiError) => void | Promise<void>

// Global interceptors
let requestInterceptors: RequestInterceptor[] = []
let responseInterceptors: ResponseInterceptor[] = []
let errorInterceptors: ErrorInterceptor[] = []

/**
 * Add a request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor)
}

/**
 * Add a response interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor)
}

/**
 * Add an error interceptor
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor) {
  errorInterceptors.push(interceptor)
}

/**
 * Remove all interceptors (useful for testing)
 */
export function clearInterceptors() {
  requestInterceptors = []
  responseInterceptors = []
  errorInterceptors = []
}

/**
 * Get auth state from localStorage (client-side only)
 * This is a helper to avoid importing Zustand store directly in the API client
 */
function getAuthState(): {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, expiresAt: null }
  }
  
  try {
    const stored = localStorage.getItem("opencall-auth")
    if (!stored) {
      return { accessToken: null, refreshToken: null, expiresAt: null }
    }
    
    const parsed = JSON.parse(stored)
    return {
      accessToken: parsed?.state?.accessToken || null,
      refreshToken: parsed?.state?.refreshToken || null,
      expiresAt: parsed?.state?.expiresAt || null,
    }
  } catch {
    return { accessToken: null, refreshToken: null, expiresAt: null }
  }
}

/**
 * Update auth state in localStorage
 */
function updateAuthState(updates: {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  isAuthenticated?: boolean
}) {
  if (typeof window === "undefined") return
  
  try {
    const stored = localStorage.getItem("opencall-auth")
    if (!stored) return
    
    const parsed = JSON.parse(stored)
    if (parsed?.state) {
      if (updates.accessToken !== undefined) {
        parsed.state.accessToken = updates.accessToken
      }
      if (updates.refreshToken !== undefined) {
        parsed.state.refreshToken = updates.refreshToken
      }
      if (updates.expiresAt !== undefined) {
        parsed.state.expiresAt = updates.expiresAt
      }
      if (updates.isAuthenticated !== undefined) {
        parsed.state.isAuthenticated = updates.isAuthenticated
      }
      
      localStorage.setItem("opencall-auth", JSON.stringify(parsed))
    }
  } catch {
    // Silently fail if localStorage update fails
  }
}

/**
 * Clear auth state from localStorage
 */
function clearAuthState() {
  if (typeof window === "undefined") return
  localStorage.removeItem("opencall-auth")
  window.dispatchEvent(new Event("auth-logout"))
}

/**
 * Check if token is expired or about to expire (within buffer time)
 * @param bufferMs - Buffer time in milliseconds (default: 60000 = 1 minute)
 */
function isTokenExpired(bufferMs: number = 60000): boolean {
  const { expiresAt } = getAuthState()
  
  if (!expiresAt) return true
  
  // Consider expired if less than buffer time remaining
  return Date.now() >= expiresAt - bufferMs
}

// Track ongoing refresh request to prevent multiple simultaneous refreshes
let refreshPromise: Promise<string | null> | null = null

/**
 * Attempt to refresh the access token
 * Uses a singleton pattern to prevent multiple simultaneous refresh requests
 */
async function refreshAccessToken(): Promise<string | null> {
  // If a refresh is already in progress, return that promise
  if (refreshPromise) {
    return refreshPromise
  }

  const { refreshToken } = getAuthState()
  if (!refreshToken) {
    return null
  }

  // Create the refresh promise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || errorData.message || "Token refresh failed",
          res.status,
          errorData
        )
      }

      const data = await res.json()
      const expiresAt = Date.now() + data.expires_in * 1000
      
      // Update auth state in localStorage
      updateAuthState({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        isAuthenticated: true,
      })

      return data.access_token
    } catch (error) {
      // Refresh failed - clear auth state
      clearAuthState()
      return null
    } finally {
      // Clear the promise so future calls can create a new one
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
  })
}

/**
 * Execute request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    createTimeoutPromise(timeout).then(() => {
      throw new ApiError("Request timeout", 408)
    }),
  ]) as Promise<Response>
}

/**
 * Base API client with interceptors and enhanced error handling
 * - handles JSON
 * - automatically injects Authorization header from auth store
 * - handles token refresh on 401 errors
 * - supports request/response/error interceptors
 * - normalizes errors with ApiError class
 * - supports request timeouts
 */
export async function apiClient<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    skipAuth = false,
    timeout = 30000, // 30 seconds default
    skipContentType = false,
  } = options

  // Get token: use provided token, or get from store, or skip if skipAuth is true
  let accessToken: string | null = null
  if (!skipAuth) {
    const authState = getAuthState()
    accessToken = token || authState.accessToken
    
    // Proactively refresh token if it's about to expire (60 second buffer)
    if (accessToken && isTokenExpired(60000)) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        accessToken = newToken
      } else {
        // Refresh failed, clear auth and let the request proceed (will get 401)
        accessToken = null
      }
    }
  }

  // Build request configuration
  const requestHeaders: Record<string, string> = {
    ...(skipContentType ? {} : { "Content-Type": "application/json" }),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...headers,
  }

  const isFormData = body instanceof FormData
  const requestBody = isFormData ? body : (body ? JSON.stringify(body) : undefined)
  const url = `${API_BASE_URL}${endpoint}`

  // Run request interceptors
  for (const interceptor of requestInterceptors) {
    await interceptor({
      url,
      method,
      headers: requestHeaders,
      body: isFormData ? "[FormData]" : (requestBody as string | undefined),
    })
  }

  // Log request in development mode
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${method} ${endpoint}`, {
      headers: { ...requestHeaders, Authorization: accessToken ? "Bearer ***" : undefined },
      body: isFormData ? "[FormData]" : (requestBody ? JSON.parse(requestBody as string) : undefined),
    })
  }

  let res: Response
  try {
    // Make the request with timeout
    res = await fetchWithTimeout(url, {
      method,
      headers: requestHeaders,
      body: requestBody as BodyInit | undefined,
    }, timeout)
  } catch (error: any) {
    // Handle timeout or network errors
    const apiError = error instanceof ApiError
      ? error
      : new ApiError(error?.message || "Network error", 0, error)
    
    // Run error interceptors
    for (const interceptor of errorInterceptors) {
      await interceptor(apiError)
    }
    
    throw apiError
  }

  const contentType = res.headers.get("content-type")
  let data: any = null
  
  if (contentType?.includes("application/json")) {
    try {
      data = await res.json()
    } catch {
      // Response is not valid JSON
      data = null
    }
  }

  // Handle 401 Unauthorized - try to refresh token once and retry
  if (res.status === 401 && !skipAuth && !token) {
    const newToken = await refreshAccessToken()
    
    if (newToken) {
      // Retry the request with new token
      const retryHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${newToken}`,
      }

      // Run request interceptors for retry
      for (const interceptor of requestInterceptors) {
        await interceptor({
          url,
          method,
          headers: retryHeaders,
          body: isFormData ? "[FormData]" : (requestBody as string | undefined),
        })
      }

      let retryRes: Response
      try {
        retryRes = await fetchWithTimeout(url, {
          method,
          headers: retryHeaders,
          body: requestBody as BodyInit | undefined,
        }, timeout)
      } catch (error: any) {
        const apiError = error instanceof ApiError
          ? error
          : new ApiError(error?.message || "Network error", 0, error)
        
        for (const interceptor of errorInterceptors) {
          await interceptor(apiError)
        }
        
        throw apiError
      }

      const retryContentType = retryRes.headers.get("content-type")
      let retryData: any = null
      
      if (retryContentType?.includes("application/json")) {
        try {
          retryData = await retryRes.json()
        } catch {
          retryData = null
        }
      }

      // Run response interceptors
      for (const interceptor of responseInterceptors) {
        await interceptor(retryRes, retryData)
      }

      if (!retryRes.ok) {
        // Handle validation errors with field-level messages
        if (retryData?.errors && typeof retryData.errors === "object") {
          const errorMessages = Object.values(retryData.errors).join(", ")
          const apiError = new ApiError(errorMessages, retryRes.status, retryData)
          
          for (const interceptor of errorInterceptors) {
            await interceptor(apiError)
          }
          
          throw apiError
        }
        
        const message = retryData?.error || retryData?.message || "Something went wrong"
        const apiError = new ApiError(message, retryRes.status, retryData)
        
        for (const interceptor of errorInterceptors) {
          await interceptor(apiError)
        }
        
        throw apiError
      }

      // Log successful retry in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[API] ${method} ${endpoint} (retried after refresh)`, retryData)
      }

      // Unwrap backend response format: { data: {...} } or { data: [...] }
      if (retryData && typeof retryData === 'object' && 'data' in retryData && Object.keys(retryData).length === 1) {
        return retryData.data as TResponse
      }

      return retryData as TResponse
    } else {
      // Refresh failed - auth state already cleared by refreshAccessToken
      const apiError = new ApiError("Authentication failed. Please login again.", 401, data)
      
      for (const interceptor of errorInterceptors) {
        await interceptor(apiError)
      }
      
      throw apiError
    }
  }

  // Run response interceptors
  for (const interceptor of responseInterceptors) {
    await interceptor(res, data)
  }

  if (!res.ok) {
    // Handle validation errors with field-level messages
    if (data?.errors && typeof data.errors === "object") {
      const errorMessages = Object.values(data.errors).join(", ")
      const apiError = new ApiError(errorMessages, res.status, data)
      
      for (const interceptor of errorInterceptors) {
        await interceptor(apiError)
      }
      
      throw apiError
    }
    
    const message = data?.error || data?.message || "Something went wrong"
    const apiError = new ApiError(message, res.status, data)
    
    for (const interceptor of errorInterceptors) {
      await interceptor(apiError)
    }
    
    throw apiError
  }

  // Log successful response in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${method} ${endpoint} ✓`, data)
  }

  // Unwrap backend response format: { data: {...} } or { data: [...] }
  // If response has a 'data' field at top level, return that instead of the wrapper
  if (data && typeof data === 'object' && 'data' in data && Object.keys(data).length === 1) {
    return data.data as TResponse
  }

  return data as TResponse
}
