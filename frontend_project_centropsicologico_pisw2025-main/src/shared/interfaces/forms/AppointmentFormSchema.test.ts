import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { appointmentFormSchema } from "./AppointmentFormSchema"

const FROZEN_TODAY = new Date("2025-01-15T12:00:00")

const validBase = {
  patientId: "pat-1",
  date: "2025-01-15",
  startTime: "09:00",
  endTime: "10:00",
  psychologistId: "psy-1",
  officeId: "off-1",
  reason: "Consulta inicial",
  typeId: "PARTICULAR",
}

describe("appointmentFormSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FROZEN_TODAY)
  })
  afterEach(() => vi.useRealTimers())

  // --- valid cases ---
  it("T01: all fields valid, date = today", () => {
    expect(appointmentFormSchema.safeParse(validBase).success).toBe(true)
  })

  it("T02: date = tomorrow passes", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, date: "2025-01-16" })
    expect(result.success).toBe(true)
  })

  it("T03: 1-minute window passes (08:00 → 08:01)", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, startTime: "08:00", endTime: "08:01" })
    expect(result.success).toBe(true)
  })

  // --- required field errors ---
  it("T04: patientId empty → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, patientId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Debe seleccionar un paciente")).toBe(true)
    }
  })

  it("T05: psychologistId empty → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, psychologistId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Debe seleccionar un psicólogo")).toBe(true)
    }
  })

  it("T06: officeId empty → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, officeId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("officeId"))).toBe(true)
    }
  })

  it("T07: reason empty → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, reason: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El motivo es requerido")).toBe(true)
    }
  })

  it("T08: typeId empty → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, typeId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "El tipo de cita es requerido")).toBe(true)
    }
  })

  // --- cross-field: time validation ---
  it("T09: endTime before startTime → error on endTime", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, startTime: "10:00", endTime: "09:00" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La hora de fin debe ser posterior a la hora de inicio")).toBe(true)
    }
  })

  it("T10: endTime equal to startTime → error (strictly greater)", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, startTime: "10:00", endTime: "10:00" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La hora de fin debe ser posterior a la hora de inicio")).toBe(true)
    }
  })

  it("T11: both times empty → refine bypassed, passes time check", () => {
    // startTime="" fails the min(1) check, so schema fails but for a different reason
    const result = appointmentFormSchema.safeParse({ ...validBase, startTime: "", endTime: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La hora de inicio es requerida")).toBe(true)
    }
  })

  // --- cross-field: date validation ---
  it("T12: past date → error", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, date: "2025-01-14" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La fecha no puede ser anterior a hoy")).toBe(true)
    }
  })

  it("T13: today → passes", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, date: "2025-01-15" })
    expect(result.success).toBe(true)
  })

  it("T14: future date → passes", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, date: "2025-12-31" })
    expect(result.success).toBe(true)
  })

  it("T15: date empty → fails required check", () => {
    const result = appointmentFormSchema.safeParse({ ...validBase, date: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "La fecha es requerida")).toBe(true)
    }
  })
})
