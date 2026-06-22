import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper } from "@/test/utils/renderWithProviders"
import {
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useUpdateAppointment,
} from "./useAppointmentMutations"
import { queryClient } from "@/lib/queryClient"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe("useCreateAppointment", () => {
  it("invalidates ['appointments'] on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/appointments", () =>
        HttpResponse.json({ id: "new-apt" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreateAppointment(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({
        patientId: "pat-1",
        psychologistId: "psy-1",
        officeId: "off-1",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        reason: "Test",
        typeId: "PARTICULAR",
      } as Parameters<typeof result.current.mutate>[0])
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["appointments"] }))
  })
})

describe("useUpdateAppointmentStatus", () => {
  it("invalidates ['appointment', id] on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/appointments/status/:id", ({ params }) =>
        HttpResponse.json({ id: params.id, status: "DONE" })
      )
    )
    const { result } = renderHook(() => useUpdateAppointmentStatus(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: "apt-1", status: "DONE" })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["appointment", "apt-1"] }))
  })
})

describe("useUpdateAppointment", () => {
  it("invalidates ['appointment', id] on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/appointments/:id", ({ params }) =>
        HttpResponse.json({ id: params.id })
      )
    )
    const { result } = renderHook(() => useUpdateAppointment(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({
        id: "apt-2",
        appointmentToUpdate: { reason: "Updated" } as Parameters<typeof result.current.mutate>[0]["appointmentToUpdate"],
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["appointment", "apt-2"] }))
  })
})
