import type { Patient } from "@/shared/interfaces/models"

export function makePatientFixture(overrides: Partial<Patient> = {}): Patient {
  return {
    id: "pat-test-1",
    firstName: "Ana",
    lastName: "Torres",
    dni: "12345678",
    gender: "FEMALE",
    birthdate: new Date("1990-01-01"),
    educationLevel: "UNIVERSITY",
    birthPlace: "Lima",
    occupation: "Estudiante",
    maritalStatus: "SINGLE",
    occupationLocation: "Lima",
    phoneNumber: "999000111",
    isActive: true,
    address: "Av. Test 123",
    districtId: "dist-1",
    district: { id: "dist-1", name: "Miraflores" },
    clinicalHistoryId: "ch-1",
    clinicalHistory: { id: "ch-1", displayInt: 1, patientTests: [], createdAt: new Date(), updatedAt: new Date() },
    appointments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
