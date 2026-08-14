import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { ProductForm } from '../components/ProductForm'
import { Table, type Column } from '../../../shared/components/Table'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Badge } from '../../../shared/components/Badge'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ToastContainer } from '../../../shared/components/ToastContainer'
import { useToast } from '../../../shared/hooks/useToast'
import { formatCurrency, formatDate, getStockColor } from '../../../shared/utils'
import type { Product } from '../types'
import type { ProductFormData } from '../validations'

export function ProductsPage() {
  const {
    products,
    loading,
    error,
    createProduct,
    editProduct,
    handleDeactivate,
    confirmDeactivateId,
    setConfirmDeactivateId,
  } = useProducts()

  const { toasts, addToast, removeToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  const openCreateModal = () => {
    setEditingProduct(undefined)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    const result = editingProduct
      ? await editProduct(editingProduct.id, data)
      : await createProduct(data)
    setSubmitting(false)

    if (result.success) {
      addToast(
        editingProduct ? 'Producto actualizado correctamente' : 'Producto registrado correctamente',
        'success'
      )
      setModalOpen(false)
    } else {
      addToast(result.error || 'Error al guardar', 'error')
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Producto' },
    {
      key: 'price',
      header: 'Precio',
      render: (p) => formatCurrency(p.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => <span className={getStockColor(p.stock)}>{p.stock}</span>,
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (p) =>
          p.isActive ? (
          <Badge className="bg-mint-dark/15 text-mint-dark">Activo</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700">Inactivo</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Registrado',
      render: (p) => formatDate(p.createdAt),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (p) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {p.isActive && (
            <>
              <Button size="sm" variant="ghost" onClick={() => openEditModal(p)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmDeactivateId(p.id)}
              >
                Desactivar
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Productos</h1>
        <Button variant="primary" onClick={openCreateModal}>+ Nuevo Producto</Button>
      </div>

      <Table columns={columns} data={products} onRowClick={openEditModal} emptyMessage="No hay productos registrados" />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          initialData={editingProduct}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeactivateId}
        onConfirm={() => confirmDeactivateId && handleDeactivate(confirmDeactivateId)}
        onCancel={() => setConfirmDeactivateId(null)}
        title="Desactivar Producto"
        message="¿Estás seguro de desactivar este producto? No estará disponible para nuevos pedidos."
        confirmLabel="Desactivar"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
