import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll, afterAll, vi } from "vitest"
import { server } from "./mocks/server"

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

vi.spyOn(console, "error").mockImplementation(() => {})
vi.spyOn(console, "log").mockImplementation(() => {})
