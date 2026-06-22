import { describe, it, expect } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper } from "@/test/utils/renderWithProviders"
import { usePatientByIdQuery, usePatientSearchQuery } from "./usePatientsQueries"

describe("usePatientByIdQuery", () => {
  it("enabled when id is truthy", async () => {
    const { result } = renderHook(() => usePatientByIdQuery({ id: "pat-1" }), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it("disabled when id is empty string", () => {
    const { result } = renderHook(() => usePatientByIdQuery({ id: "" }), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })
})

describe("usePatientSearchQuery (HU02)", () => {
  it("query disabled when both fields are empty", () => {
    const { result } = renderHook(() => usePatientSearchQuery(), { wrapper: createWrapper() })
    expect(result.current.patients).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it("fires search when name is set", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/patients/search", () =>
        HttpResponse.json([{ id: "pat-1", firstName: "Ana", lastName: "Torres", dni: "12345678" }])
      )
    )
    const { result } = renderHook(() => usePatientSearchQuery(), { wrapper: createWrapper() })
    act(() => result.current.setFirstnameQuery("Ana"))
    await waitFor(() => expect(result.current.patients.length).toBeGreaterThan(0))
    expect(result.current.patients[0].firstName).toBe("Ana")
  })

  it("fires search when DNI is set (HU02: keeps DNI search)", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/patients/search", () =>
        HttpResponse.json([{ id: "pat-2", firstName: "Luis", lastName: "Ríos", dni: "12345000" }])
      )
    )
    const { result } = renderHook(() => usePatientSearchQuery(), { wrapper: createWrapper() })
    act(() => result.current.setDniQuery("12345"))
    await waitFor(() => expect(result.current.patients.length).toBeGreaterThan(0))
    expect(result.current.patients[0].dni).toBe("12345000")
  })

  it("returns empty array when API returns []", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/patients/search", () =>
        HttpResponse.json([])
      )
    )
    const { result } = renderHook(() => usePatientSearchQuery(), { wrapper: createWrapper() })
    act(() => result.current.setFirstnameQuery("ZZZ"))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.patients).toEqual([])
  })

  it("partial name match still fires query (HU02: partial search)", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/patients/search", () =>
        HttpResponse.json([{ id: "pat-3", firstName: "Andrea", lastName: "Mora", dni: "11111111" }])
      )
    )
    const { result } = renderHook(() => usePatientSearchQuery(), { wrapper: createWrapper() })
    act(() => result.current.setFirstnameQuery("an"))
    await waitFor(() => expect(result.current.patients.length).toBeGreaterThan(0))
  })
})
