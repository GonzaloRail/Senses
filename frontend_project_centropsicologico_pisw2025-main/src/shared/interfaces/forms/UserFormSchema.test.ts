import { describe, it, expect } from "vitest"
import { userFormSchema } from "./UserFormSchema"

const validBase = {
  firstName: "Carlos",
  lastName: "López",
  email: "carlos@example.com",
  roles: ["ADMIN"],
  cv: undefined,
  title: undefined,
  mentalHealthCertificate: undefined,
  presentationLetter: undefined,
  certificate: undefined,
  csp: "",
  dni: "12345678",
  psychologistId: "",
  isActive: true,
}

const withFile = (field: string) => ({ [field]: new File(["content"], "test.pdf", { type: "application/pdf" }) })
const withUrl = (field: string) => ({ [field]: "https://example.com/file.pdf" })

describe("userFormSchema", () => {
  // --- valid combos ---
  it("U01: ADMIN role, no files required → passes", () => {
    expect(userFormSchema.safeParse(validBase).success).toBe(true)
  })

  it("U02: PSYCHOLOGIST with all files as File instances → passes", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST"],
      ...withFile("cv"),
      ...withFile("title"),
      ...withFile("certificate"),
      ...withFile("mentalHealthCertificate"),
    }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("U03: PSYCHOLOGIST with all files as string URLs → passes", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST"],
      ...withUrl("cv"),
      ...withUrl("title"),
      ...withUrl("certificate"),
      ...withUrl("mentalHealthCertificate"),
    }
    expect(userFormSchema.safeParse(data).success).toBe(true)
  })

  it("U04: INTERNAL with presentationLetter + mentalHealthCertificate → passes", () => {
    const data = {
      ...validBase,
      roles: ["INTERNAL"],
      ...withFile("presentationLetter"),
      ...withFile("mentalHealthCertificate"),
    }
    expect(userFormSchema.safeParse(data).success).toBe(true)
  })

  it("U05: ADMISSION with cv + mentalHealthCertificate → passes", () => {
    const data = {
      ...validBase,
      roles: ["ADMISSION"],
      ...withFile("cv"),
      ...withFile("mentalHealthCertificate"),
    }
    expect(userFormSchema.safeParse(data).success).toBe(true)
  })

  it("U06: PSYCHOLOGIST+INTERNAL — INTERNAL dominates, only presentationLetter + mentalHealth required", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST", "INTERNAL"],
      ...withFile("presentationLetter"),
      ...withFile("mentalHealthCertificate"),
    }
    expect(userFormSchema.safeParse(data).success).toBe(true)
  })

  it("U07: csp = '' → passes (literal empty string allowed)", () => {
    expect(userFormSchema.safeParse({ ...validBase, csp: "" }).success).toBe(true)
  })

  it("U08: csp = 'PSY-1234' → passes", () => {
    expect(userFormSchema.safeParse({ ...validBase, csp: "PSY-1234" }).success).toBe(true)
  })

  it("U09: roles = ['ADMIN'] — 1 role is within bounds → passes", () => {
    expect(userFormSchema.safeParse({ ...validBase, roles: ["ADMIN"] }).success).toBe(true)
  })

  // --- invalid cases ---
  it("U10: roles = [] → 'Debe seleccionar al menos un rol'", () => {
    const result = userFormSchema.safeParse({ ...validBase, roles: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Debe seleccionar al menos un rol")).toBe(true)
    }
  })

  it("U11: INTERNAL+ADMIN → 'No puede ser Interno y Gerente simultáneamente'", () => {
    const result = userFormSchema.safeParse({ ...validBase, roles: ["INTERNAL", "ADMIN"] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "No puede ser Interno y Gerente simultáneamente")).toBe(true)
    }
  })

  it("U12: PSYCHOLOGIST without title → issue on title", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST"],
      ...withFile("cv"),
      ...withFile("certificate"),
      ...withFile("mentalHealthCertificate"),
    }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("title"))).toBe(true)
    }
  })

  it("U13: PSYCHOLOGIST without cv → issue on cv", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST"],
      ...withFile("title"),
      ...withFile("certificate"),
      ...withFile("mentalHealthCertificate"),
    }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("cv"))).toBe(true)
    }
  })

  it("U14: PSYCHOLOGIST without certificate → issue on certificate", () => {
    const data = {
      ...validBase,
      roles: ["PSYCHOLOGIST"],
      ...withFile("cv"),
      ...withFile("title"),
      ...withFile("mentalHealthCertificate"),
    }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("certificate"))).toBe(true)
    }
  })

  it("U15: ADMISSION without cv → issue on cv", () => {
    const data = {
      ...validBase,
      roles: ["ADMISSION"],
      ...withFile("mentalHealthCertificate"),
    }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("cv"))).toBe(true)
    }
  })

  it("U16: ADMISSION without mentalHealthCertificate → issue", () => {
    const data = { ...validBase, roles: ["ADMISSION"], ...withFile("cv") }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("mentalHealthCertificate"))).toBe(true)
    }
  })

  it("U17: INTERNAL without presentationLetter → issue", () => {
    const data = { ...validBase, roles: ["INTERNAL"], ...withFile("mentalHealthCertificate") }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("presentationLetter"))).toBe(true)
    }
  })

  it("U18: INTERNAL without mentalHealthCertificate → issue", () => {
    const data = { ...validBase, roles: ["INTERNAL"], ...withFile("presentationLetter") }
    const result = userFormSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("mentalHealthCertificate"))).toBe(true)
    }
  })

  it("U19: dni with 7 digits → 'El DNI debe tener 8 dígitos'", () => {
    const result = userFormSchema.safeParse({ ...validBase, dni: "1234567" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El DNI debe tener 8 dígitos")).toBe(true)
    }
  })

  it("U20: dni with 9 digits → 'El DNI debe tener 8 dígitos'", () => {
    const result = userFormSchema.safeParse({ ...validBase, dni: "123456789" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El DNI debe tener 8 dígitos")).toBe(true)
    }
  })

  it("U21: invalid email → 'Correo electrónico inválido'", () => {
    const result = userFormSchema.safeParse({ ...validBase, email: "notanemail" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Correo electrónico inválido")).toBe(true)
    }
  })

  it("U22: 4 roles → 'No puede seleccionar más de 3 roles'", () => {
    const result = userFormSchema.safeParse({ ...validBase, roles: ["ADMIN", "PSYCHOLOGIST", "ADMISSION", "INTERNAL"] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "No puede seleccionar más de 3 roles")).toBe(true)
    }
  })
})
