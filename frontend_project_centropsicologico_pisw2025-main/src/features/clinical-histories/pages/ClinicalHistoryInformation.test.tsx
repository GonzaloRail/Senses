import { describe, it, expect, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/mocks/server"
import { renderWithProviders } from "@/test/utils/renderWithProviders"
import { ClinicalHistoryInformation } from "./ClinicalHistoryInformation"

// Mock components with complex sidebar/ui dependencies
vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button>sidebar</button>,
}))

vi.mock("@/shared/utils/formatters", () => ({
  calculateAgeString: () => "35 años",
  getBirthdateString: () => "01/01/1990",
  translateGender: (g: string) => g,
  translateMaritalStatus: (s: string) => s,
}))

vi.mock("../components/ClinicalHistorySections ", () => ({
  ClinicalHistorySections: () => <div data-testid="sections">Sections</div>,
}))

vi.mock("@/shared/components/Loading", () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}))

// Simulate router param id="ch-1"
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return {
    ...actual,
    useParams: () => ({ id: "ch-1" }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

describe("ClinicalHistoryInformation (HU06)", () => {
  it("shows loading state while data is fetching", () => {
    server.use(
      http.get("http://localhost:5000/api/v1/clinical-histories/:id", async () => {
        await new Promise(() => {}) // never resolves → loading state
      })
    )
    renderWithProviders(<ClinicalHistoryInformation />, { initialEntries: ["/clinical-histories/ch-1"] })
    expect(screen.getByText("Cargando historia clínica...")).toBeInTheDocument()
  })

  it("shows patient name from API response", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/clinical-histories/:id", () =>
        HttpResponse.json({
          id: "ch-1",
          displayInt: 1,
          patientTests: [],
          patient: {
            id: "pat-1",
            firstName: "María",
            lastName: "Gómez",
            dni: "12345678",
            gender: "FEMALE",
            maritalStatus: "SINGLE",
            birthdate: "1990-01-01T00:00:00Z",
            phoneNumber: "999000111",
            address: "Av. Test 123",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      ),
      http.get("http://localhost:5000/api/v1/evaluations/clinical-history/:id/sections/sorted", () =>
        HttpResponse.json([])
      )
    )
    renderWithProviders(<ClinicalHistoryInformation />, { initialEntries: ["/clinical-histories/ch-1"] })
    await waitFor(() => expect(screen.getByText(/María/)).toBeInTheDocument())
    expect(screen.getByText(/Gómez/)).toBeInTheDocument()
  })

  it("shows 'No se encontró la historia clínica' when API returns empty", async () => {
    server.use(
      http.get("http://localhost:5000/api/v1/clinical-histories/:id", () =>
        HttpResponse.json(null)
      ),
      http.get("http://localhost:5000/api/v1/evaluations/clinical-history/:id/sections/sorted", () =>
        HttpResponse.json([])
      )
    )
    renderWithProviders(<ClinicalHistoryInformation />, { initialEntries: ["/clinical-histories/ch-1"] })
    await waitFor(() =>
      expect(screen.getByText("No se encontró la historia clínica")).toBeInTheDocument()
    )
  })
})
