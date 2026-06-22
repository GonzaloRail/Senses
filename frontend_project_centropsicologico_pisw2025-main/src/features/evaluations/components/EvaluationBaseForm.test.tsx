import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { EvaluationFormSchema } from "@/shared/interfaces/forms/EvaluationFormSchema"
import { evaluationFormSchema } from "@/shared/interfaces/forms/EvaluationFormSchema"
import { EvaluationBaseForm } from "./EvaluationBaseForm"

vi.mock("@/shared/components/SiteHeader", () => ({
  SiteHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

vi.mock("@/shared/components/Loading", () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}))

vi.mock("@/shared/components/EmptyState", () => ({
  EmptyState: () => <div>No tests</div>,
}))

vi.mock("./UploadedTest", () => ({
  UploadedTest: () => <div>UploadedTest</div>,
}))

const defaultValues: EvaluationFormSchema = {
  name: "Triage",
  description: "Evaluación inicial",
  isActive: true,
  openNewSection: false,
  psychologicalTests: [],
}

function Wrapper({ mode }: { mode: "view" | "create" | "edit" }) {
  const form = useForm<EvaluationFormSchema>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues,
  })
  return (
    <EvaluationBaseForm
      form={form}
      mode={mode}
      onSubmit={vi.fn()}
      handleCancel={vi.fn()}
      loading={false}
    />
  )
}

describe("EvaluationBaseForm (HU07)", () => {
  it("view mode: title is 'Detalle de evaluación'", () => {
    render(<Wrapper mode="view" />)
    expect(screen.getByText("Detalle de evaluación")).toBeInTheDocument()
  })

  it("create mode: title is 'Crear nueva evaluación'", () => {
    render(<Wrapper mode="create" />)
    expect(screen.getByText("Crear nueva evaluación")).toBeInTheDocument()
  })

  it("edit mode: title is 'Editar evaluación'", () => {
    render(<Wrapper mode="edit" />)
    expect(screen.getByText("Editar evaluación")).toBeInTheDocument()
  })

  it("view mode: name input is readOnly", () => {
    render(<Wrapper mode="view" />)
    const nameInput = screen.getByPlaceholderText("Ingresa el nombre de la evaluación...")
    expect(nameInput).toHaveAttribute("readonly")
  })

  it("edit mode: name input is NOT readOnly", () => {
    render(<Wrapper mode="edit" />)
    const nameInput = screen.getByPlaceholderText("Ingresa el nombre de la evaluación...")
    expect(nameInput).not.toHaveAttribute("readonly")
  })

  it("loading=true → shows loading message instead of form", () => {
    function LoadingWrapper() {
      const form = useForm<EvaluationFormSchema>({
        resolver: zodResolver(evaluationFormSchema),
        defaultValues: { name: "", description: "", isActive: true, openNewSection: false, psychologicalTests: [] },
      })
      return (
        <EvaluationBaseForm
          form={form}
          mode="view"
          onSubmit={vi.fn()}
          handleCancel={vi.fn()}
          loading={true}
        />
      )
    }
    render(<LoadingWrapper />)
    expect(screen.getByText("Cargando evaluación...")).toBeInTheDocument()
  })

  it("view mode: form fields render with defaultValues", () => {
    render(<Wrapper mode="view" />)
    const input = screen.getByPlaceholderText("Ingresa el nombre de la evaluación...")
    expect(input).toHaveValue("Triage")
  })
})
