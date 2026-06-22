import { describe, it, expect, vi, beforeEach } from "vitest"
import { useAuth } from "@/store/auth/auth.store"
import { queryClient } from "@/lib/queryClient"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true,
  configurable: true,
})

// Simulate the request interceptor logic extracted from api.ts
function applyRequestInterceptor(config: Record<string, unknown>) {
  const token = useAuth.getState().accessToken
  if (token) {
    config.headers = { ...((config.headers as object) || {}), Authorization: `Bearer ${token}` }
  }
  return config
}

// Simulate the response interceptor logic extracted from api.ts
async function applyResponseInterceptorError(
  error: { response?: { status: number }; config?: { url?: string; _retry?: boolean; headers?: Record<string, string> }; message?: string },
  refreshFn: () => Promise<{ accessToken: string; roleSelected: string }>,
  retryFn: (config: unknown) => Promise<unknown>
) {
  const originalRequest = error.config || {}
  const isLoginOrRefresh =
    originalRequest.url?.includes("/auth/login") ||
    originalRequest.url?.includes("/auth/refresh-token")

  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !isLoginOrRefresh
  ) {
    originalRequest._retry = true
    try {
      const res = await refreshFn()
      useAuth.getState().setAuth({ accessToken: res.accessToken, roleSelected: res.roleSelected })
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${res.accessToken}` }
      return retryFn(originalRequest)
    } catch {
      useAuth.getState().setAuth({ accessToken: null, user: null })
      queryClient.clear()
      window.location.href = "/auth"
      return
    }
  }
  return Promise.reject(error)
}

beforeEach(() => {
  useAuth.setState({ accessToken: null, user: null, roleSelected: null, isAuthBootstrapped: false })
  window.location.href = ""
  vi.clearAllMocks()
})

describe("Request interceptor logic", () => {
  it("I01: injects Bearer token when accessToken is in store", () => {
    useAuth.setState({ accessToken: "my-token", isAuthBootstrapped: true })
    const config = { headers: {} }
    const result = applyRequestInterceptor(config)
    expect((result.headers as Record<string, string>)["Authorization"]).toBe("Bearer my-token")
  })

  it("I02: no Authorization header when accessToken is null", () => {
    useAuth.setState({ accessToken: null, isAuthBootstrapped: true })
    const config: { headers: Record<string, string> } = { headers: {} }
    applyRequestInterceptor(config)
    expect(config.headers["Authorization"]).toBeUndefined()
  })
})

describe("Response interceptor logic — 401 handling", () => {
  it("I03: 401 on regular endpoint triggers refresh", async () => {
    useAuth.setState({ accessToken: "expired", isAuthBootstrapped: true })
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: "new-token", roleSelected: "ADMIN" })
    const retryFn = vi.fn().mockResolvedValue({})

    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/appointments" } },
      refreshFn,
      retryFn
    )
    expect(refreshFn).toHaveBeenCalled()
    expect(retryFn).toHaveBeenCalled()
  })

  it("I04: successful refresh → retry with new token in header", async () => {
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: "new-tok", roleSelected: "ADMIN" })
    const retryFn = vi.fn().mockResolvedValue({})
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/anything", headers: {} } },
      refreshFn,
      retryFn
    )
    const retryConfig = retryFn.mock.calls[0][0] as Record<string, unknown>
    expect((retryConfig.headers as Record<string, string>)["Authorization"]).toBe("Bearer new-tok")
  })

  it("I05: successful refresh → setAuth called with new accessToken", async () => {
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: "fresh", roleSelected: "ADMIN" })
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/x" } },
      refreshFn,
      vi.fn().mockResolvedValue({})
    )
    expect(useAuth.getState().accessToken).toBe("fresh")
  })

  it("I06: 401 on /auth/login URL → no refresh attempted", async () => {
    const refreshFn = vi.fn()
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/auth/login" } },
      refreshFn,
      vi.fn()
    ).catch(() => {})
    expect(refreshFn).not.toHaveBeenCalled()
  })

  it("I07: 401 on /auth/refresh-token → no refresh attempted", async () => {
    const refreshFn = vi.fn()
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/auth/refresh-token" } },
      refreshFn,
      vi.fn()
    ).catch(() => {})
    expect(refreshFn).not.toHaveBeenCalled()
  })

  it("I08: failed refresh → accessToken set to null", async () => {
    useAuth.setState({ accessToken: "expired", isAuthBootstrapped: true })
    const refreshFn = vi.fn().mockRejectedValue(new Error("refresh failed"))
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/x" } },
      refreshFn,
      vi.fn()
    )
    expect(useAuth.getState().accessToken).toBeNull()
  })

  it("I09: failed refresh → queryClient.clear() called", async () => {
    const spy = vi.spyOn(queryClient, "clear")
    const refreshFn = vi.fn().mockRejectedValue(new Error("fail"))
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/x" } },
      refreshFn,
      vi.fn()
    )
    expect(spy).toHaveBeenCalled()
  })

  it("I10: failed refresh → window.location.href set to /auth", async () => {
    const refreshFn = vi.fn().mockRejectedValue(new Error("fail"))
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/x" } },
      refreshFn,
      vi.fn()
    )
    expect(window.location.href).toBe("/auth")
  })

  it("I11: _retry=true → no second retry", async () => {
    const refreshFn = vi.fn()
    await applyResponseInterceptorError(
      { response: { status: 401 }, config: { url: "/api/v1/x", _retry: true } },
      refreshFn,
      vi.fn()
    ).catch(() => {})
    expect(refreshFn).not.toHaveBeenCalled()
  })

  it("I12: non-401 error → rejected promise", async () => {
    const error = { response: { status: 500 }, config: { url: "/api/v1/x" } }
    await expect(
      applyResponseInterceptorError(error, vi.fn(), vi.fn())
    ).rejects.toEqual(error)
  })
})
