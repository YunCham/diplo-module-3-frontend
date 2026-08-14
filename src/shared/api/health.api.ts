import api from './axiosInstance'

export interface HealthData {
  database: string
}

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '')

export const healthApi = {
  check: () => api.get<HealthData>(`${apiRoot}/health`).then((r) => r.data),
}
