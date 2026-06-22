import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const systemUserHandlers = [
  http.get(`${BASE}/users`, () =>
    HttpResponse.json({ currentPage: 1, totalPages: 1, users: [] })
  ),
  http.get(`${BASE}/users/:id`, ({ params }) =>
    HttpResponse.json({ id: params.id, firstName: "Test", lastName: "User" })
  ),
  http.post(`${BASE}/users`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: "user-new-1" }, { status: 201 })
  }),
  http.put(`${BASE}/users/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: params.id })
  }),
]
