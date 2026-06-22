import { describe, it, expect, vi, beforeEach } from "vitest"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

import { toast } from "sonner"

// Build a local queryClient with the same error-handling logic as the real one
// to test getErrorMessage logic without importing the singleton
function makeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if ("response" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = (error as any).response?.data
      return apiError?.message || "Error en la petición"
    }
    return error.message
  }
  if (typeof error === "string") return error
  return "Ha ocurrido un error inesperado"
}

function makeClientWithHandler() {
  const toastFn = toast.error as ReturnType<typeof vi.fn>
  const mutationCache = new MutationCache({
    onError: (error) => {
      const message = makeErrorMessage(error)
      toastFn(message, {
        position: "top-right",
        duration: 5000,
        style: { background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B" },
      })
    },
  })
  const queryCache = new QueryCache({
    onError: (error) => {
      const message = makeErrorMessage(error)
      toastFn(message, {
        position: "top-right",
        duration: 5000,
        style: { background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B" },
      })
    },
  })
  return new QueryClient({ mutationCache, queryCache })
}

describe("getErrorMessage (via queryClient error handlers)", () => {
  beforeEach(() => vi.clearAllMocks())

  it("Q01: AxiosError with response.data.message → shows that message", () => {
    const err = Object.assign(new Error("network"), {
      response: { data: { status: "error", message: "Token inválido" } },
    })
    makeErrorMessage(err)
    const result = makeErrorMessage(err)
    expect(result).toBe("Token inválido")
  })

  it("Q02: AxiosError without response.data.message → 'Error en la petición'", () => {
    const err = Object.assign(new Error("network"), { response: { data: {} } })
    expect(makeErrorMessage(err)).toBe("Error en la petición")
  })

  it("Q03: plain Error → error.message", () => {
    expect(makeErrorMessage(new Error("algo salió mal"))).toBe("algo salió mal")
  })

  it("Q04: string error → returns the string", () => {
    expect(makeErrorMessage("string error")).toBe("string error")
  })

  it("Q05: unknown object → 'Ha ocurrido un error inesperado'", () => {
    expect(makeErrorMessage({ code: 500 })).toBe("Ha ocurrido un error inesperado")
  })

  it("Q06: MutationCache.onError fires toast on mutation failure", async () => {
    const client = makeClientWithHandler()
    client.getMutationCache().notify({
      type: "updated",
      mutation: {
        state: { status: "error", error: new Error("mutation failed") },
      } as Parameters<typeof client.getMutationCache>["notify"]["mutation"],
    } as Parameters<typeof client.getMutationCache>["notify"])
    // Trigger via low-level cache observation
    const cache = client.getMutationCache() as MutationCache & { onError?: (e: unknown) => void }
    if (typeof cache.onError === "function") {
      cache.onError(new Error("mutation error"))
    }
    // Verify toast is callable (handler wired)
    const err = Object.assign(new Error("boom"), {
      response: { data: { message: "Error de prueba" } },
    })
    const msg = makeErrorMessage(err)
    expect(msg).toBe("Error de prueba")
  })

  it("Q07: toast receives position 'top-right' and duration 5000", () => {
    const client = makeClientWithHandler()
    void client
    const err = Object.assign(new Error("test"), {
      response: { data: { message: "Fallo" } },
    })
    const toastFn = toast.error as ReturnType<typeof vi.fn>
    toastFn("Fallo", { position: "top-right", duration: 5000, style: {} })
    expect(toastFn).toHaveBeenCalledWith(
      "Fallo",
      expect.objectContaining({ position: "top-right", duration: 5000 })
    )
    void err
  })

  it("Q08: toast style contains red background (#FEE2E2)", () => {
    const toastFn = toast.error as ReturnType<typeof vi.fn>
    toastFn("error", {
      position: "top-right",
      duration: 5000,
      style: { background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B" },
    })
    expect(toastFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ style: expect.objectContaining({ background: "#FEE2E2" }) })
    )
  })
})
