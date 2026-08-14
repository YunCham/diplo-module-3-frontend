import api from './axiosInstance'
import type { Client } from '../../modules/clients/types'

export interface CreateClientPayload {
  fullName: string
  email: string
  phone?: string
}

export interface UpdateClientPayload {
  fullName?: string
  email?: string
  phone?: string
}

export const clientsApi = {
  getAll: (isActive?: boolean) => api.get<Client[]>('/customers', { params: { isActive } }).then((r) => r.data),

  getById: (id: string) => api.get<Client>(`/customers/${id}`).then((r) => r.data),

  create: (data: CreateClientPayload) =>
    api.post<Client>('/customers', data).then((r) => r.data),

  update: (id: string, data: UpdateClientPayload) =>
    api.patch<Client>(`/customers/${id}`, data).then((r) => r.data),

  deactivate: (id: string) =>
    api.patch<Client>(`/customers/${id}/deactivate`).then((r) => r.data),
}
