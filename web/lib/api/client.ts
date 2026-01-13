const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface RequestOptions<TBody> {
  method?: HTTPMethod
  body?: TBody
  token?: string
  headers?: Record<string, string>
}

/**
 * Base API client
 * - handles JSON
 * - injects Authorization header
 * - normalizes errors
 */
export async function apiClient<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, token, headers = {} } = options

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  })

  const contentType = res.headers.get("content-type")

  let data: any = null
  if (contentType?.includes("application/json")) {
    data = await res.json()
  }

  if (!res.ok) {
    const message =  data?.error || data?.message || "Something went wrong"
    throw new Error(message)
  }

  return data as TResponse
}
