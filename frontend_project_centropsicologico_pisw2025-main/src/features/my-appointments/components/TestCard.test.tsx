import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { TestCard } from "./TestCard"

const defaultProps = {
  patientTestId: "pt-1",
  templateTestId: "tt-1",
  name: "Test A",
  templateUrl: "https://example.com/template.pdf",
  onOverrideFile: vi.fn().mockResolvedValue(true),
  handleCreatePatientTest: vi.fn().mockResolvedValue(undefined),
}

describe("TestCard (HU05)", () => {
  it("renders test name", () => {
    render(<TestCard {...defaultProps} />)
    expect(screen.getByText("Test A")).toBeInTheDocument()
  })

  it("shows 'Ningún archivo cargado' when no uploadedFileName", () => {
    render(<TestCard {...defaultProps} uploadedFileName={undefined} />)
    expect(screen.getByText("Ningún archivo cargado")).toBeInTheDocument()
  })

  it("shows uploaded file name when uploadedFileName is provided", () => {
    render(<TestCard {...defaultProps} uploadedFileName="resultado.pdf" />)
    expect(screen.getByText(/resultado\.pdf/)).toBeInTheDocument()
  })

  it("'Ver archivo' button visible only when uploadedFile is provided", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" })
    render(<TestCard {...defaultProps} uploadedFile={file} />)
    expect(screen.getByText("Ver archivo")).toBeInTheDocument()
  })

  it("'Ver archivo' button absent when no uploadedFile", () => {
    render(<TestCard {...defaultProps} uploadedFile={undefined} />)
    expect(screen.queryByText("Ver archivo")).toBeNull()
  })

  it("'Subir archivo' button always visible", () => {
    render(<TestCard {...defaultProps} />)
    expect(screen.getByText("Subir archivo")).toBeInTheDocument()
  })

  it("'Descargar plantilla' link renders with correct href", () => {
    render(<TestCard {...defaultProps} />)
    const link = screen.getByText("Descargar plantilla").closest("a")
    expect(link).toHaveAttribute("href", "https://example.com/template.pdf")
    expect(link).toHaveAttribute("download")
  })
})
