import { describe, it, expect, beforeEach } from "vitest"
import { useAuth, getAuth, setAuth, clearAuth } from "./auth.store"

beforeEach(() => {
  useAuth.setState({
    accessToken: null,
    user: null,
    roleSelected: null,
    isAuthBootstrapped: false,
  })
})

describe("auth store", () => {
  it("A01: initial state has nulls and isAuthBootstrapped=false", () => {
    const state = getAuth()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.roleSelected).toBeNull()
    expect(state.isAuthBootstrapped).toBe(false)
  })

  it("A02: setAuth with accessToken sets token and isAuthBootstrapped=true", () => {
    setAuth({ accessToken: "token-abc" })
    const state = getAuth()
    expect(state.accessToken).toBe("token-abc")
    expect(state.isAuthBootstrapped).toBe(true)
  })

  it("A03: setAuth with user preserves existing accessToken", () => {
    setAuth({ accessToken: "token-abc" })
    setAuth({ user: { id: "u-1" } as ReturnType<typeof getAuth>["user"] })
    const state = getAuth()
    expect(state.accessToken).toBe("token-abc")
    expect(state.user?.id).toBe("u-1")
  })

  it("A04: clearAuth resets all fields, isAuthBootstrapped=true", () => {
    setAuth({ accessToken: "token-abc", user: { id: "u-1" } as ReturnType<typeof getAuth>["user"] })
    clearAuth()
    const state = getAuth()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.roleSelected).toBeNull()
    expect(state.isAuthBootstrapped).toBe(true)
  })

  it("A05: getAuth returns current state synchronously", () => {
    setAuth({ accessToken: "sync-token" })
    expect(getAuth().accessToken).toBe("sync-token")
  })

  it("A06: setAuth helper delegates to store.setAuth", () => {
    setAuth({ roleSelected: "ADMIN" })
    expect(useAuth.getState().roleSelected).toBe("ADMIN")
  })

  it("A07: clearAuth helper delegates to store.clearAuth", () => {
    setAuth({ accessToken: "abc" })
    clearAuth()
    expect(useAuth.getState().accessToken).toBeNull()
  })

  it("A08: rapid sequential setAuth calls — last write wins", () => {
    setAuth({ accessToken: "first" })
    setAuth({ accessToken: "second" })
    setAuth({ accessToken: "third" })
    expect(getAuth().accessToken).toBe("third")
  })
})
