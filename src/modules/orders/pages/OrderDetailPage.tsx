import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { useOrderStore } from '../store'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Button } from '../../../shared/components/Button'
import { ToastContainer } from '../../../shared/components/ToastContainer'
import { useToast } from '../../../shared/hooks/useToast'
import { formatCurrency, formatDate } from '../../../shared/utils'
import type { OrderStatus } from '../types'

const statusTransitions: { current: OrderStatus; next: OrderStatus; label: string }[] = [
  { current: 'PENDING', next: 'CONFIRMED', label: 'Confirmar' },
  { current: 'CONFIRMED', next: 'DELIVERED', label: 'Marcar como Entregado' },
]

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { changeStatus } = useOrders()
  const currentOrder = useOrderStore((s) => s.currentOrder)
  const fetchOrderById = useOrderStore((s) => s.fetchOrderById)
  const loading = useOrderStore((s) => s.loading)
  const { toasts, addToast, removeToast } = useToast()

  const order = currentOrder

  useEffect(() => {
    if (id) fetchOrderById(id)
  }, [id, fetchOrderById])

  if (!id) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Pedido no encontrado</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            Volver a Pedidos
          </Button>
        </div>
    )
  }

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Pedido no encontrado</p>
        <Button className="mt-4" onClick={() => navigate('/orders')}>
          Volver a Pedidos
        </Button>
      </div>
    )
  }

  const handleStatusChange = async (status: OrderStatus) => {
    await changeStatus(order.id, status)
    addToast(
      `Pedido ${status === 'CONFIRMED' ? 'confirmado' : status === 'DELIVERED' ? 'marcado como entregado' : 'actualizado'}`,
      'success'
    )
  }

  const handleCancel = async () => {
    await changeStatus(order.id, 'CANCELLED')
    addToast('Pedido cancelado', 'success')
  }

  const transition = statusTransitions.find((t) => t.current === order.status)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-brand hover:text-brand-deep mb-2 inline-block"
          >
            ← Volver a pedidos
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pedido #{order.id.slice(0, 8)}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Productos</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Producto</th>
                  <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Precio</th>
                  <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Cantidad</th>
                  <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.productId} className="border-b last:border-0">
                    <td className="py-3 font-medium dark:text-gray-100">{item.productName || 'Producto'}</td>
                    <td className="py-3 text-right dark:text-gray-100">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right dark:text-gray-100">{item.amount}</td>
                    <td className="py-3 text-right font-semibold dark:text-gray-100">
                      {formatCurrency(item.unitPrice * item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right py-3 font-semibold text-base dark:text-gray-100">
                    Total
                  </td>
                  <td className="text-right py-3 font-bold text-lg dark:text-gray-100">{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{order.customerName || 'Cliente'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha del pedido</h3>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <div className="pt-4 border-t space-y-2">
                {transition && (
                  <Button className="w-full" onClick={() => handleStatusChange(transition.next)}>
                    {transition.label}
                  </Button>
                )}
                {order.status === 'PENDING' && (
                  <Button variant="danger" className="w-full" onClick={handleCancel}>
                    Cancelar Pedido
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
