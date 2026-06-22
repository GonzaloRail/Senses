import type { ClinicalHistory } from "@/shared/interfaces/models"

export function makeClinicalHistoryFixture(
  overrides: Partial<ClinicalHistory> = {}
): ClinicalHistory {
  return {
    id: "ch-test-1",
    displayInt: 1,
    patientTests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
