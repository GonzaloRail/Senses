import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDebounce } from "./useDebounceHooks"

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("D01: returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300))
    expect(result.current).toBe("initial")
  })

  it("D02: does not update within delay window", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    })
    rerender({ value: "updated" })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe("initial")
  })

  it("D03: updates after delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    })
    rerender({ value: "updated" })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe("updated")
  })

  it("D04: resets timer on rapid value changes — only last value propagates", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    })
    rerender({ value: "b" })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: "c" })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: "final" })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe("final")
  })

  it("D05: cleanup on unmount — no pending state update after unmount", () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "start" },
    })
    rerender({ value: "changed" })
    unmount()
    // Should not throw after advancing timers post-unmount
    expect(() => act(() => vi.advanceTimersByTime(300))).not.toThrow()
  })
})
