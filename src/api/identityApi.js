import { createHttpClient } from './httpClient'

/**
 * Gọi identity-service qua API Gateway
 *  - BASE_URL  : http://localhost:8080
 *  - API_PREFIX: /api/v1
 */
const GATEWAY_BASE_URL =
  import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8080'

const API_PREFIX =
  import.meta.env.VITE_GATEWAY_API_PREFIX || '/api/v1'

const client = createHttpClient(GATEWAY_BASE_URL)

/**
 * Login
 * POST {BASE}/api/v1/auth/authenticate
 *
 * Body (LoginRequest):
 * {
 *   "email": "admin@mobilehub.com",
 *   "password": "...."
 * }
 */
export async function loginApi(payload) {
  const res = await client.post(`${API_PREFIX}/auth/authenticate`, payload)
  return res.data
}

/**
 * Logout
 * POST {BASE}/api/v1/auth/logout
 * Gửi kèm Authorization: Bearer <accessToken>
 */
export async function logoutApi(accessToken) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined

  const res = await client.post(`${API_PREFIX}/auth/logout`, {}, { headers })
  return res.data
}
