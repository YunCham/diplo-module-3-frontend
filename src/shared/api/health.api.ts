import api from './axiosInstance'

export interface HealthData {
  database: string
}

export const healthApi = {
  check: () => api.get<HealthData>('/health').then((r) => r.data),
}
