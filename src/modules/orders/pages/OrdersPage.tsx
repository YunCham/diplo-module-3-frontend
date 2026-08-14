import { useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Table, type Column } from '../../../shared/components/Table'
import { Button } from '../../../shared/components/Button'
import { formatCurrency, formatDate } from '../../../shared/utils'
import type { Order } from '../types'

export function OrdersPage() {
  const { orders, loading, error } = useOrders()
  const navigate = useNavigate()

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Pedido',
      render: (o) => <span className="font-mono text-xs text-gray-500">{o.id.slice(0, 8)}...</span>,
    },
    { key: 'customerName', header: 'Cliente' },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (o) => formatDate(o.createdAt),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => <span className="font-semibold">{formatCurrency(o.total)}</span>,
    },
    {
      key: 'items',
      header: 'Productos',
      render: (o) => `${o.items?.length || 0} producto(s)`,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pedidos</h1>
        <Button variant="primary" onClick={() => navigate('/orders/new')}>+ Nuevo Pedido</Button>
      </div>

      <Table
        columns={columns}
        data={orders}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        emptyMessage="No hay pedidos registrados"
      />
    </div>
  )
}
