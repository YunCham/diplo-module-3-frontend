import { create } from 'zustand'
import type { Order, OrderItem, OrderStatus } from '../types'
import { ordersApi } from '../../../shared/api'
import { useClientStore } from '../../clients/store'
import { useProductStore } from '../../products/store'

function enrichOrder(order: Order): Order {
  const clientStore = useClientStore.getState()
  const productStore = useProductStore.getState()
  return {
    ...order,
    customerName: clientStore.getClientById(order.customerId)?.fullName || 'Cliente',
    items: order.items?.map((item) => enrichItem(item)) || [],
  }
}

function enrichItem(item: OrderItem): OrderItem {
  const productStore = useProductStore.getState()
  return {
    ...item,
    productName: productStore.getProductById(item.productId)?.name || 'Producto',
  }
}

interface OrderStore {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: string) => Promise<void>
  createOrder: (data: { customerId: string; items: { productId: string; amount: number }[] }) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  getOrderById: (id: string) => Order | undefined
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const orders = await ordersApi.getAll()
      const enriched = orders.map(enrichOrder)
      set({ orders: enriched, loading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar pedidos'
      set({ error: msg, loading: false })
    }
  },

  fetchOrderById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const order = await ordersApi.getById(id)
      const enriched = enrichOrder(order)
      set((state) => ({
        currentOrder: enriched,
        orders: state.orders.map((o) => (o.id === id ? enriched : o)),
        loading: false,
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar pedido'
      set({ error: msg, loading: false, currentOrder: null })
    }
  },

  createOrder: async (data) => {
    const newOrder = await ordersApi.create(data)
    const enriched = enrichOrder(newOrder)
    set((state) => ({ orders: [...state.orders, enriched] }))
    return enriched
  },

  updateOrderStatus: async (id, status) => {
    const updated = await ordersApi.updateStatus(id, status)
    const existing = get().orders.find((o) => o.id === id)
    const merged = {
      ...existing,
      ...updated,
      customerName: existing?.customerName || 'Cliente',
      items: updated.items?.map(enrichItem) || existing?.items || [],
    }
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? merged : o)),
      currentOrder: state.currentOrder?.id === id ? merged : state.currentOrder,
    }))
  },

  getOrderById: (id) => get().orders.find((o) => o.id === id),
}))
