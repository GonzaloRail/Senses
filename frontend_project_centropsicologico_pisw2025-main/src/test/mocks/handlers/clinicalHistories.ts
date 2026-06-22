import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const clinicalHistoryHandlers = [
  http.get(`${BASE}/clinical-histories`, () =>
    HttpResponse.json({ currentPage: 1, totalPages: 1, clinicalHistories: [] })
  ),
  http.get(`${BASE}/clinical-histories/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      displayInt: 1,
      patientTests: [],
      patient: {
        id: "pat-1",
        firstName: "Ana",
        lastName: "Torres",
        dni: "12345678",
        gender: "FEMALE",
        maritalStatus: "SINGLE",
        address: "Av. Test 123",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  http.get(`${BASE}/evaluations/clinical-history/:id/sections/sorted`, () =>
    HttpResponse.json([
      { id: "sec-1", name: "Sección 1", order: 1, isDefault: true, evaluations: [] },
    ])
  ),
]
