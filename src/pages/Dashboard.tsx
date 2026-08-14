import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientStore } from '../modules/clients/store'
import { useProductStore } from '../modules/products/store'
import { useOrderStore } from '../modules/orders/store'
import { formatCurrency } from '../shared/utils'

export function Dashboard() {
  const navigate = useNavigate()

  const clients = useClientStore((s) => s.clients)
  const products = useProductStore((s) => s.products)
  const orders = useOrderStore((s) => s.orders)

  const fetchClients = useClientStore((s) => s.fetchClients)
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const fetchOrders = useOrderStore((s) => s.fetchOrders)

  const loadingClients = useClientStore((s) => s.loading)
  const loadingProducts = useProductStore((s) => s.loading)
  const loadingOrders = useOrderStore((s) => s.loading)

  useEffect(() => {
    fetchClients()
    fetchProducts()
    fetchOrders()
  }, [fetchClients, fetchProducts, fetchOrders])

  const isLoading = loadingClients || loadingProducts || loadingOrders
  const allEmpty = clients.length === 0 && products.length === 0 && orders.length === 0

  const activeClients = clients.filter((c) => c.isActive)
  const activeProducts = products.filter((p) => p.isActive)
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.total, 0)

  const stats = [
    {
      label: 'Clientes Activos',
      value: activeClients.length,
      total: clients.length,
      color: 'bg-brand',
      link: '/clients',
    },
    {
      label: 'Productos Activos',
      value: activeProducts.length,
      total: products.length,
      color: 'bg-mint-dark',
      link: '/products',
    },
    {
      label: 'Pedidos Pendientes',
      value: pendingOrders.length,
      total: orders.length,
      color: 'bg-gold',
      link: '/orders',
    },
    {
      label: 'Ingresos (Entregados)',
      value: formatCurrency(totalRevenue),
      color: 'bg-brand-deep',
      link: '/orders',
    },
  ]

  if (isLoading && allEmpty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.link)}
            className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6 text-left hover:shadow-md dark:hover:shadow-brand-deepest/50 transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            {'total' in stat && stat.total !== undefined && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">de {stat.total} total</p>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Últimos Pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay pedidos registrados</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(-5).reverse().map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-brand/20 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.customerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.items?.length || 0} producto(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-gray-100">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Productos con Stock Bajo</h2>
          {products.filter((p) => p.isActive && p.stock <= 5).length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay productos con stock bajo</p>
          ) : (
            <div className="space-y-3">
              {products
                .filter((p) => p.isActive && p.stock <= 5)
                .sort((a, b) => a.stock - b.stock)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => navigate('/products')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-brand/20 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                    <span
                      className={`text-sm font-semibold ${
                        product.stock === 0 ? 'text-red-600' : 'text-orange-500'
                      }`}
                    >
                      {product.stock} unidades
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
