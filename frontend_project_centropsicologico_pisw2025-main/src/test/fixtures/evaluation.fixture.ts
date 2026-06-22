import type { Evaluation } from "@/shared/interfaces/models"

export function makeEvaluationFixture(
  overrides: Partial<Evaluation> = {}
): Evaluation {
  return {
    id: "eval-test-1",
    name: "Triage",
    description: "Evaluación inicial de triage",
    isActive: true,
    createdById: "u-1",
    createdBy: { id: "u-1", firstName: "Admin", lastName: "Test" } as Evaluation["createdBy"],
    tests: [],
    openNewSection: false,
    sectionOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
