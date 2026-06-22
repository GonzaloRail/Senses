import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { patientFormSchema } from "./PatientFormSchema"

const FROZEN_TODAY = new Date("2025-01-15T12:00:00")

const validBase = {
  firstName: "Ana",
  lastName: "Torres",
  dni: "12345678",
  gender: "FEMALE",
  birthdate: "1990-06-15",
  educationLevel: "UNIVERSITY",
  birthPlace: "Lima",
  occupation: "Estudiante",
  maritalStatus: "SINGLE",
  occupationLocation: "Lima",
  phoneNumber: "999000111",
  isActive: true,
  address: "Av. Test 123",
  districtId: "dist-1",
  provinceId: "prov-1",
  regionId: "reg-1",
}

describe("patientFormSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FROZEN_TODAY)
  })
  afterEach(() => vi.useRealTimers())

  it("valid patient data → passes", () => {
    expect(patientFormSchema.safeParse(validBase).success).toBe(true)
  })

  // HU03: same phone is allowed if DNI is different
  it("HU03: phoneNumber has no uniqueness constraint in schema → duplicate phone allowed", () => {
    // The schema should not validate phone uniqueness (that's a backend concern)
    const patient1 = patientFormSchema.safeParse({ ...validBase, phoneNumber: "999000111", dni: "12345678" })
    const patient2 = patientFormSchema.safeParse({ ...validBase, phoneNumber: "999000111", dni: "87654321" })
    expect(patient1.success).toBe(true)
    expect(patient2.success).toBe(true)
  })

  it("phoneNumber min 6 chars enforced", () => {
    const result = patientFormSchema.safeParse({ ...validBase, phoneNumber: "12345" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("phoneNumber"))).toBe(true)
    }
  })

  it("firstName empty → 'El nombre es obligatorio'", () => {
    const result = patientFormSchema.safeParse({ ...validBase, firstName: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El nombre es obligatorio")).toBe(true)
    }
  })

  it("dni with 7 digits → error", () => {
    const result = patientFormSchema.safeParse({ ...validBase, dni: "1234567" })
    expect(result.success).toBe(false)
  })

  it("future birthdate → 'La fecha de nacimiento no puede ser futura'", () => {
    const result = patientFormSchema.safeParse({ ...validBase, birthdate: "2026-01-01" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La fecha de nacimiento no puede ser futura")).toBe(true)
    }
  })

  it("parentDni same as patient dni → error", () => {
    const result = patientFormSchema.safeParse({ ...validBase, parentDni: "12345678" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El DNI del padre no puede ser igual al DNI del paciente")).toBe(true)
    }
  })

  it("parentDni different from patient dni → passes", () => {
    const result = patientFormSchema.safeParse({ ...validBase, parentDni: "99999999" })
    expect(result.success).toBe(true)
  })
})
