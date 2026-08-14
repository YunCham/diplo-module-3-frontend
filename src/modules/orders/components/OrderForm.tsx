import { useState, useMemo } from 'react'
import { useClientStore } from '../../clients/store'
import { useProductStore } from '../../products/store'
import { Button } from '../../../shared/components/Button'
import { formatCurrency, getStockColor } from '../../../shared/utils'
import type { OrderFormItem } from '../types'

interface OrderFormProps {
  onSubmit: (data: { customerId: string; items: OrderFormItem[] }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function OrderForm({ onSubmit, onCancel, isSubmitting }: OrderFormProps) {
  const allClients = useClientStore((s) => s.clients)
  const allProducts = useProductStore((s) => s.products)
  const getProduct = useProductStore((s) => s.getProductById)

  const clients = useMemo(() => allClients.filter((c) => c.isActive), [allClients])
  const products = useMemo(() => allProducts.filter((p) => p.isActive), [allProducts])

  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<OrderFormItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [amount, setAmount] = useState(1)
  const [error, setError] = useState('')

  const selectedProduct = useMemo(
    () => (selectedProductId ? getProduct(selectedProductId) : undefined),
    [selectedProductId, getProduct]
  )

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.amount, 0),
    [items]
  )

  const addItem = () => {
    if (!selectedProductId) {
      setError('Seleccione un producto')
      return
    }
    if (amount <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    const product = getProduct(selectedProductId)
    if (!product) {
      setError('Producto no encontrado')
      return
    }

    const existingIndex = items.findIndex((i) => i.productId === selectedProductId)
    const neededAmount = existingIndex >= 0 ? items[existingIndex].amount + amount : amount

    if (product.stock < neededAmount) {
      setError(
        `Stock insuficiente. Disponible: ${product.stock}, ${
          existingIndex >= 0
            ? `ya tienes ${items[existingIndex].amount} en el pedido`
            : `solicitaste ${amount}`
        }`
      )
      return
    }

    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === selectedProductId
            ? { ...item, amount: item.amount + amount }
            : item
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          amount,
          unitPrice: product.price,
        },
      ])
    }

    setSelectedProductId('')
    setAmount(1)
    setError('')
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const handleSubmit = () => {
    if (!customerId) {
      setError('Seleccione un cliente')
      return
    }
    if (items.length === 0) {
      setError('Agregue al menos un producto')
      return
    }
    setError('')
    onSubmit({ customerId, items })
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cliente <span className="text-red-500">*</span>
        </label>
        <select
          id="customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="block w-full rounded-md border border-gray-300 dark:border-brand/30 bg-white dark:bg-brand-deep/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/30 dark:text-gray-100"
        >
          <option value="">Seleccione un cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} — {c.email}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Agregar Productos</h3>
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-6">
            <label htmlFor="product" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Producto
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 dark:border-brand/30 bg-white dark:bg-brand-deep/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/30 dark:text-gray-100"
            >
              <option value="">Seleccionar</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} ({p.stock} disponibles) — {formatCurrency(p.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label htmlFor="amount" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Cantidad
            </label>
            <input
              id="amount"
              type="number"
              min={1}
              max={selectedProduct?.stock || 1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 dark:border-brand/30 bg-white dark:bg-brand-deep/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/30 dark:text-gray-100"
            />
          </div>
          <div className="col-span-3">
            <Button type="button" size="sm" className="w-full" onClick={addItem}>
              Agregar
            </Button>
          </div>
        </div>
        {selectedProduct && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Precio unitario: {formatCurrency(selectedProduct.price)} — Stock:{' '}
            <span className={getStockColor(selectedProduct.stock)}>{selectedProduct.stock}</span>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Productos en el pedido</h3>
          <div className="border rounded-lg divide-y dark:divide-gray-700">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between px-4 py-2 text-sm">
                <div>
                  <span className="font-medium dark:text-gray-100">{item.productName}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    x{item.amount} — {formatCurrency(item.unitPrice)} c/u
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold dark:text-gray-100">
                    {formatCurrency(item.unitPrice * item.amount)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    aria-label={`Eliminar ${item.productName}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            Total: {formatCurrency(total)}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} disabled={items.length === 0 || !customerId}>
          Crear Pedido
        </Button>
      </div>
    </div>
  )
}
