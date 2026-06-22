import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const evaluationHandlers = [
  http.get(`${BASE}/evaluations/list`, () =>
    HttpResponse.json({ currentPage: 1, totalPages: 1, evaluations: [] })
  ),
  http.get(`${BASE}/evaluations/sections/orders`, () =>
    HttpResponse.json([])
  ),
  http.get(`${BASE}/evaluations/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: "Triage",
      description: "Evaluación inicial",
      isActive: true,
      openNewSection: false,
      sectionOrder: 1,
      tests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  http.post(`${BASE}/evaluations`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: "eval-new-1" }, { status: 201 })
  }),
  http.put(`${BASE}/evaluations/sections/orders`, () =>
    HttpResponse.json({ success: true })
  ),
  http.put(`${BASE}/evaluations/status/:id`, ({ params }) =>
    HttpResponse.json({ id: params.id, isActive: false })
  ),
  http.put(`${BASE}/evaluations/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, id: params.id })
  }),
  http.post(`${BASE}/tests`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...(body as object), id: "test-new-1", evaluationId: "eval-1" }, { status: 201 })
  }),
  http.post(`${BASE}/tests/batch`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...body, evaluationId: "eval-1" }, { status: 201 })
  }),
  http.put(`${BASE}/tests/:id`, ({ params }) =>
    HttpResponse.json({ id: params.id, isActive: false, evaluationId: "eval-1" })
  ),
]
