import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { useProductStore } from '../../products/store'
import { useClientStore } from '../../clients/store'
import { OrderForm } from '../components/OrderForm'
import { ToastContainer } from '../../../shared/components/ToastContainer'
import { useToast } from '../../../shared/hooks/useToast'
import type { OrderFormItem } from '../types'

export function NewOrderPage() {
  const navigate = useNavigate()
  const { placeOrder, loading: orderLoading } = useOrders()
  const { toasts, addToast, removeToast } = useToast()

  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const fetchClients = useClientStore((s) => s.fetchClients)
  const products = useProductStore((s) => s.products)
  const clients = useClientStore((s) => s.clients)

  useEffect(() => {
    if (products.length === 0) fetchProducts()
    if (clients.length === 0) fetchClients()
  }, [products.length, clients.length, fetchProducts, fetchClients])

  const handleSubmit = async (data: { customerId: string; items: OrderFormItem[] }) => {
    const result = await placeOrder({
      customerId: data.customerId,
      items: data.items,
    })
    if (result.success) {
      addToast('Pedido creado correctamente', 'success')
      setTimeout(() => navigate('/orders'), 1000)
    } else {
      addToast(result.error || 'Error al crear el pedido', 'error')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuevo Pedido</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete los datos para crear un nuevo pedido</p>
      </div>

      <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6 max-w-2xl">
        <OrderForm onSubmit={handleSubmit} onCancel={() => navigate('/orders')} isSubmitting={orderLoading} />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
