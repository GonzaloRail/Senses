import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper } from "@/test/utils/renderWithProviders"
import { useCreatePatient, useUpdatePatient } from "./usePatientsMutation"
import { queryClient } from "@/lib/queryClient"
import { makePatientFixture } from "@/test/fixtures/patient.fixture"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe("useCreatePatient (HU03)", () => {
  it("201 → invalidates ['patients']", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/patients", () =>
        HttpResponse.json({ id: "new-pat" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreatePatient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(makePatientFixture())
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["patients"] }))
  })

  it("HU03: same phone, different DNI — creates successfully (no schema uniqueness constraint)", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/patients", () =>
        HttpResponse.json({ id: "dup-phone-pat" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreatePatient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(makePatientFixture({ phoneNumber: "999000111", dni: "99999999" }))
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalled()
  })

  it("409 DNI conflict → mutation errors", async () => {
    server.use(
      http.post("http://localhost:5000/api/v1/patients", () =>
        HttpResponse.json({ message: "DNI ya registrado" }, { status: 409 })
      )
    )
    const { result } = renderHook(() => useCreatePatient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(makePatientFixture())
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useUpdatePatient", () => {
  it("invalidates ['patient', id] on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/patients/:id", ({ params }) =>
        HttpResponse.json({ id: params.id })
      )
    )
    const { result } = renderHook(() => useUpdatePatient(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: "pat-1", patientToUpdate: { firstName: "Updated" } })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["patient", "pat-1"] }))
  })
})
