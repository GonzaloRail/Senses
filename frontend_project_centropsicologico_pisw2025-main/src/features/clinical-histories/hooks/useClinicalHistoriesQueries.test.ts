import { describe, it, expect } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper } from "@/test/utils/renderWithProviders"
import {
  useClinicalHistoryByIdQuery,
  useGetAllEvaluationsByClinicalHistoryIdSortedBySectionQuery,
} from "./useClinicalHistoriesQueries"

describe("useClinicalHistoryByIdQuery (HU06)", () => {
  it("fetches clinical history by id", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/clinical-histories/:id", ({ params }) =>
        HttpResponse.json({ id: params.id, displayInt: 1, patientTests: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      )
    )
    const { result } = renderHook(() => useClinicalHistoryByIdQuery("ch-1"), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe("ch-1")
  })

  it("disabled when id is empty string", () => {
    const { result } = renderHook(() => useClinicalHistoryByIdQuery(""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("propagates 404 error", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/clinical-histories/:id", () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 })
      )
    )
    const { result } = renderHook(() => useClinicalHistoryByIdQuery("bad-id"), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useGetAllEvaluationsByClinicalHistoryIdSortedBySectionQuery (HU06)", () => {
  it("fetches sorted sections by clinical history id", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/evaluations/clinical-history/:id/sections/sorted", () =>
        HttpResponse.json([
          { id: "sec-1", name: "Sección A", order: 1, isDefault: true, evaluations: [] },
          { id: "sec-2", name: "Sección B", order: 2, isDefault: false, evaluations: [] },
        ])
      )
    )
    const { result } = renderHook(
      () => useGetAllEvaluationsByClinicalHistoryIdSortedBySectionQuery("ch-1"),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it("disabled when id is empty string", () => {
    const { result } = renderHook(
      () => useGetAllEvaluationsByClinicalHistoryIdSortedBySectionQuery(""),
      { wrapper: createWrapper() }
    )
    expect(result.current.fetchStatus).toBe("idle")
  })
})
