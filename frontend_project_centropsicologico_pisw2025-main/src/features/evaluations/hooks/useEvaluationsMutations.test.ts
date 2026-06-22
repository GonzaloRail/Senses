import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { createWrapper } from "@/test/utils/renderWithProviders"
import {
  useCreateEvaluation,
  useUpdateEvaluation,
  useUpdateSectionsOrders,
  useUpdateEvaluationStatus,
  useCreateTest,
  useCreateTestBatch,
  useUpdateTestStatus,
} from "./useEvaluationsMutations"
import { queryClient } from "@/lib/queryClient"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe("useCreateEvaluation (HU07)", () => {
  it("invalidates 4 query keys on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/evaluations", () =>
        HttpResponse.json({ id: "eval-1" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreateEvaluation(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({
        evaluationToCreate: {
          name: "Triage",
          description: "Eval",
          createdById: "u-1",
          openNewSection: false,
        },
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-1"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["sections"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["clinical-history-sorted"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["clinical-history"] }))
  })
})

describe("useUpdateEvaluation (HU07)", () => {
  it("invalidates evaluation and sections on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/evaluations/:id", ({ params }) =>
        HttpResponse.json({ id: params.id })
      )
    )
    const { result } = renderHook(() => useUpdateEvaluation(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({
        id: "eval-2",
        evaluationToUpdate: { name: "Updated", description: "desc", isActive: true },
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-2"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["sections"] }))
  })
})

describe("useUpdateSectionsOrders (HU08)", () => {
  it("PUT to correct endpoint and invalidates sections + history", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    let requestReceived = false
    server.use(
      http.put("http://localhost:5000/api/v1/evaluations/sections/orders", () => {
        requestReceived = true
        return HttpResponse.json({ success: true })
      })
    )
    const { result } = renderHook(() => useUpdateSectionsOrders(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ evaluations: [{ id: "eval-1", sectionOrder: 1 }] })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requestReceived).toBe(true)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["sections"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["clinical-history-sorted"] }))
  })
})

describe("useUpdateEvaluationStatus (HU07)", () => {
  it("invalidates evaluation + clinical histories on success", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/evaluations/status/:id", ({ params }) =>
        HttpResponse.json({ id: params.id, isActive: false })
      )
    )
    const { result } = renderHook(() => useUpdateEvaluationStatus(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: "eval-3", isActive: false })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-3"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["clinical-history-sorted"] }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["clinical-history"] }))
  })
})

describe("useCreateTest (HU08)", () => {
  it("invalidates ['evaluation', evaluationId] from variables", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/tests", () =>
        HttpResponse.json({ id: "test-1", evaluationId: "eval-X" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreateTest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({
        testToCreate: {
          evaluationId: "eval-X",
          name: "Test A",
          description: "desc",
          filename: "test.pdf",
          fileurl: "",
        } as Parameters<typeof result.current.mutate>[0]["testToCreate"],
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-X"] }))
  })
})

describe("useCreateTestBatch (HU08)", () => {
  it("invalidates ['evaluation', evaluationId] from response", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.post("http://localhost:5000/api/v1/tests/batch", () =>
        HttpResponse.json({ evaluationId: "eval-Y" }, { status: 201 })
      )
    )
    const { result } = renderHook(() => useCreateTestBatch(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ testsToCreate: [] })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-Y"] }))
  })
})

describe("useUpdateTestStatus (HU08)", () => {
  it("invalidates ['evaluation', evaluationId] from response", async () => {
    const spy = vi.spyOn(queryClient, "invalidateQueries")
    server.use(
      http.put("http://localhost:5000/api/v1/tests/:id", ({ params }) =>
        HttpResponse.json({ id: params.id, evaluationId: "eval-Z", isActive: false })
      )
    )
    const { result } = renderHook(() => useUpdateTestStatus(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: "test-1", isActive: false })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["evaluation", "eval-Z"] }))
  })
})
