import { http, HttpResponse } from "msw"

const BASE = "http://localhost:5000/api/v1"

export const authHandlers = [
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ token: "access-token-abc", user: { id: "u-1", firstName: "Admin", lastName: "Test" } })
  ),
  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ success: true })
  ),
  http.post(`${BASE}/auth/refresh-token`, () =>
    HttpResponse.json({ accessToken: "new-access-token", roleSelected: "ADMIN" })
  ),
  http.post(`${BASE}/auth/select-role`, () =>
    HttpResponse.json({ accessToken: "role-token", roleSelected: "ADMISSION" })
  ),
]
