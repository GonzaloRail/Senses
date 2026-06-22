import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const appointmentHandlers = [
  http.get(`${BASE}/appointments`, () =>
    HttpResponse.json({ data: [], total: 0, page: 1, take: 10 })
  ),
  http.get(`${BASE}/appointments/by_date`, () =>
    HttpResponse.json({ data: [], total: 0, page: 1, take: 10 })
  ),
  http.get(`${BASE}/appointments/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      reason: "Consulta inicial",
      status: "PENDING",
      patient: { id: "pat-1", firstName: "Ana", lastName: "Torres", dni: "12345678" },
      user: { id: "psy-1", firstName: "Dr. Carlos", lastName: "López", dni: "87654321" },
      office: { id: "off-1", name: "Consultorio A", type: "STANDARD", capacity: 1, location: { id: "loc-1", name: "Sede Central", address: "Av. Principal 123" } },
      type: "PARTICULAR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  http.post(`${BASE}/appointments`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: "new-apt-1" }, { status: 201 })
  }),
  http.put(`${BASE}/appointments/status/:id`, ({ params }) =>
    HttpResponse.json({ id: params.id, status: "DONE" })
  ),
  http.put(`${BASE}/appointments/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: params.id })
  }),
]
