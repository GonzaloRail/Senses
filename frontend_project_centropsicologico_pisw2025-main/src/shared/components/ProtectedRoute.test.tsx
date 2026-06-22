import { describe, it, expect, beforeEach, vi } from "vitest"
import { render } from "@testing-library/react"
import { useAuth } from "@/store/auth/auth.store"
import { ProtectedRoute } from "./ProtectedRoute"

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router")
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet</div>,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Navigate to {to}</div>,
  }
})

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuth.setState({ user: null, roleSelected: null })
  })

  it("allows access when role matches", () => {
    useAuth.setState({ user: { id: "1", email: "test@test.com" }, roleSelected: "ADMIN" })
    const { getByTestId } = render(<ProtectedRoute allowedRoles={["ADMIN"]} />)
    expect(getByTestId("outlet")).toBeTruthy()
  })

  it("denies access when role not in allowed list", () => {
    useAuth.setState({ user: { id: "1", email: "test@test.com" }, roleSelected: "USER" })
    const { getByTestId } = render(<ProtectedRoute allowedRoles={["ADMIN"]} />)
    expect(getByTestId("navigate")).toBeTruthy()
  })

  it("denies access when user not authenticated", () => {
    useAuth.setState({ user: null, roleSelected: null })
    const { getByTestId } = render(<ProtectedRoute allowedRoles={["ADMIN"]} />)
    expect(getByTestId("navigate")).toBeTruthy()
  })
})
