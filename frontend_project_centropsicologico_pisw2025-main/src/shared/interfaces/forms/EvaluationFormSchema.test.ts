import { describe, it, expect } from "vitest"
import { evaluationFormSchema } from "./EvaluationFormSchema"

const validBase = {
  name: "Triage",
  description: "Evaluación inicial",
  isActive: true,
  openNewSection: false,
  psychologicalTests: [],
}

describe("evaluationFormSchema", () => {
  it("valid form passes", () => {
    expect(evaluationFormSchema.safeParse(validBase).success).toBe(true)
  })

  it("name empty → 'El nombre es requerido'", () => {
    const result = evaluationFormSchema.safeParse({ ...validBase, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El nombre es requerido")).toBe(true)
    }
  })

  it("description exactly 255 chars → passes", () => {
    const result = evaluationFormSchema.safeParse({ ...validBase, description: "a".repeat(255) })
    expect(result.success).toBe(true)
  })

  it("description 256 chars → fails", () => {
    const result = evaluationFormSchema.safeParse({ ...validBase, description: "a".repeat(256) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La descripción no puede exceder los 255 caracteres")).toBe(true)
    }
  })

  it("description undefined → passes (optional)", () => {
    const result = evaluationFormSchema.safeParse({ ...validBase, description: undefined })
    expect(result.success).toBe(true)
  })

  it("psychologicalTest with empty name → fails", () => {
    const result = evaluationFormSchema.safeParse({
      ...validBase,
      psychologicalTests: [{ name: "", filename: "test.pdf" }],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El nombre del test es requerido")).toBe(true)
    }
  })

  it("valid psychologicalTest → passes", () => {
    const result = evaluationFormSchema.safeParse({
      ...validBase,
      psychologicalTests: [{ name: "Test A", filename: "test.pdf" }],
    })
    expect(result.success).toBe(true)
  })
})
