import type { AppointmentViewResponse } from "@/shared/interfaces/apiResponses/getAppointmentByIdResponse"

export function makeAppointmentFixture(
  overrides: Partial<AppointmentViewResponse> = {}
): AppointmentViewResponse {
  return {
    id: "apt-test-1",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    reason: "Consulta inicial",
    status: "PENDING",
    patient: { id: "pat-1", firstName: "Ana", lastName: "Torres", dni: "12345678" },
    user: { id: "psy-1", firstName: "Carlos", lastName: "López", dni: "87654321" },
    office: {
      id: "off-1",
      name: "Consultorio A",
      type: "STANDARD",
      capacity: 1,
      location: { id: "loc-1", name: "Sede Central", address: "Av. Principal 123" },
    },
    type: "PARTICULAR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
