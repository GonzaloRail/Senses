import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const patientHandlers = [
  http.get(`${BASE}/patients`, () =>
    HttpResponse.json({ currentPage: 1, totalPages: 1, patients: [] })
  ),
  http.get(`${BASE}/patients/search`, () =>
    HttpResponse.json([
      { id: "pat-1", firstName: "Ana", lastName: "Torres", dni: "12345678" },
    ])
  ),
  http.get(`${BASE}/patients/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      firstName: "Ana",
      lastName: "Torres",
      dni: "12345678",
      gender: "FEMALE",
      birthdate: "1990-01-01",
      phoneNumber: "999000111",
      isActive: true,
    })
  ),
  http.post(`${BASE}/patients`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: "new-pat-1" }, { status: 201 })
  }),
  http.put(`${BASE}/patients/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: params.id })
  }),
]
