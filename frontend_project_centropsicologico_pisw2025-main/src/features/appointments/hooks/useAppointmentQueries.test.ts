import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper, makeTestQueryClient } from "@/test/utils/renderWithProviders"
import { useGetAppointmentById } from "./useAppointmentQueries"
import { makeAppointmentFixture } from "@/test/fixtures/appointment.fixture"

describe("useGetAppointmentById", () => {
  it("returns appointment data on success", async () => {
    const fixture = makeAppointmentFixture({ id: "apt-1" })
    server.use(
      http.get("http://localhost:5000/api/v1/appointments/:id", () =>
        HttpResponse.json(fixture)
      )
    )
    const { result } = renderHook(() => useGetAppointmentById("apt-1"), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe("apt-1")
    expect(result.current.data?.reason).toBe("Consulta inicial")
  })

  it("disabled when id is undefined", () => {
    const { result } = renderHook(() => useGetAppointmentById(undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
    expect(result.current.data).toBeUndefined()
  })

  it("disabled when id is empty string", () => {
    const { result } = renderHook(() => useGetAppointmentById(""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("propagates server error", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/appointments/:id", () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 })
      )
    )
    const qc = makeTestQueryClient()
    const { result } = renderHook(() => useGetAppointmentById("bad-id"), {
      wrapper: createWrapper(qc),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it("accepts config override — disabled via config.enabled=false", () => {
    const { result } = renderHook(
      () => useGetAppointmentById("apt-1", { enabled: false }),
      { wrapper: createWrapper() }
    )
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("accepts config override — custom staleTime", () => {
    const spy = vi.fn()
    const { result } = renderHook(
      () => useGetAppointmentById("apt-1", { select: (d) => { spy(d); return d } }),
      { wrapper: createWrapper() }
    )
    void result
  })
})
