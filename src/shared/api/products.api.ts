import api from './axiosInstance'
import type { Product } from '../../modules/products/types'

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
  stock: number
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  price?: number
  stock?: number
}

export const productsApi = {
  getAll: (isActive?: boolean) => api.get<Product[]>('/products', { params: { isActive } }).then((r) => r.data),

  getById: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: CreateProductPayload) =>
    api.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: UpdateProductPayload) =>
    api.patch<Product>(`/products/${id}`, data).then((r) => r.data),

  deactivate: (id: string) =>
    api.patch<Product>(`/products/${id}/deactivate`).then((r) => r.data),
}
