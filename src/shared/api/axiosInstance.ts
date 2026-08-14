import axios from 'axios'
import type { ApiEnvelope } from './envelope'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export interface ApiErrorDetail {
  field: string | null
  message: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors: ApiErrorDetail[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope<unknown>
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      if (body.success) {
        response.data = body.data
      } else {
        const msg = body.errors?.[0]?.message || body.message || 'Error del servidor'
        return Promise.reject(new ApiError(msg, body.statusCode, body.errors || []))
      }
    }
    return response
  },
  (error) => {
    if (error.response?.data) {
      const body = error.response.data as ApiEnvelope<unknown>
      const detail = body.errors?.[0]?.message || body.message
      return Promise.reject(new ApiError(detail || 'Error del servidor', body.statusCode, body.errors || []))
    }
    return Promise.reject(new ApiError('Error de conexión con el servidor', 0, []))
  }
)

export default api
