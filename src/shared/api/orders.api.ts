import api from './axiosInstance'
import type { Order, OrderStatus } from '../../modules/orders/types'

export interface CreateOrderPayload {
  customerId: string
  items: { productId: string; amount: number }[]
}

export interface GetOrdersParams {
  status?: OrderStatus
  customerId?: string
}

export const ordersApi = {
  getAll: (params?: GetOrdersParams) => api.get<Order[]>('/orders', { params }).then((r) => r.data),

  getById: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (data: CreateOrderPayload) =>
    api.post<Order>('/orders', data).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
}
