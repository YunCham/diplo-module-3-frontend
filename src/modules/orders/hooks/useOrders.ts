import { useEffect, useCallback } from 'react'
import { useOrderStore } from '../store'
import { useProductStore } from '../../products/store'
import { useClientStore } from '../../clients/store'
import type { OrderFormData } from '../validations'
import type { OrderStatus } from '../types'

export function useOrders() {
  const { orders, loading, error, fetchOrders, createOrder, updateOrderStatus, getOrderById } =
    useOrderStore()
  const productStore = useProductStore()
  const clientStore = useClientStore()

  useEffect(() => {
    if (orders.length === 0) fetchOrders()
  }, [orders.length, fetchOrders])

  const placeOrder = useCallback(
    async (data: OrderFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        const client = clientStore.getClientById(data.customerId)
        if (!client) return { success: false, error: 'El cliente no existe' }
        if (!client.isActive) return { success: false, error: 'El cliente está inactivo' }

        for (const item of data.items) {
          const product = productStore.getProductById(item.productId)
          if (!product) return { success: false, error: `Producto "${item.productName}" no encontrado` }
          if (!product.isActive) return { success: false, error: `El producto "${product.name}" está inactivo` }
          if (!productStore.hasSufficientStock(item.productId, item.amount)) {
            return {
              success: false,
              error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.amount}`,
            }
          }
        }

        await createOrder({
          customerId: data.customerId,
          items: data.items.map((i) => ({ productId: i.productId, amount: i.amount })),
        })

        await productStore.fetchProducts()

        return { success: true }
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Error al crear pedido' }
      }
    },
    [createOrder, productStore, clientStore]
  )

  const changeStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, status)
      } catch {
        // error handled in store
      }
    },
    [updateOrderStatus]
  )

  const getOrder = useCallback((id: string) => getOrderById(id), [getOrderById])

  return { orders, loading, error, placeOrder, changeStatus, getOrder }
}
