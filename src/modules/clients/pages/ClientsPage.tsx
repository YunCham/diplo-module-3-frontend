import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { ClientForm } from '../components/ClientForm'
import { Table, type Column } from '../../../shared/components/Table'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { Badge } from '../../../shared/components/Badge'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ToastContainer } from '../../../shared/components/ToastContainer'
import { useToast } from '../../../shared/hooks/useToast'
import { formatDate } from '../../../shared/utils'
import type { Client } from '../types'
import type { ClientFormData } from '../validations'

export function ClientsPage() {
  const {
    clients,
    loading,
    error,
    createClient,
    editClient,
    handleDeactivate,
    confirmDeactivateId,
    setConfirmDeactivateId,
  } = useClients()

  const { toasts, addToast, removeToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  const openCreateModal = () => {
    setEditingClient(undefined)
    setModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  const handleSubmit = async (data: ClientFormData) => {
    setSubmitting(true)
    const result = editingClient
      ? await editClient(editingClient.id, data)
      : await createClient(data)
    setSubmitting(false)

    if (result.success) {
      addToast(
        editingClient ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente',
        'success'
      )
      setModalOpen(false)
    } else {
      addToast(result.error || 'Error al guardar', 'error')
    }
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    )
  }

  if (error && clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

  const columns: Column<Client>[] = [
    { key: 'fullName', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (c) => c.phone || '—',
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (c) =>
          c.isActive ? (
          <Badge className="bg-mint-dark/15 text-mint-dark">Activo</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700">Inactivo</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Registrado',
      render: (c) => formatDate(c.createdAt),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (c) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {c.isActive && (
            <>
              <Button size="sm" variant="ghost" onClick={() => openEditModal(c)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmDeactivateId(c.id)}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
        <Button variant="primary" onClick={openCreateModal}>+ Nuevo Cliente</Button>
      </div>

      <Table columns={columns} data={clients} onRowClick={openEditModal} emptyMessage="No hay clientes registrados" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          initialData={editingClient}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeactivateId}
        onConfirm={() => confirmDeactivateId && handleDeactivate(confirmDeactivateId)}
        onCancel={() => setConfirmDeactivateId(null)}
        title="Desactivar Cliente"
        message="¿Estás seguro de desactivar este cliente? No podrá crear nuevos pedidos."
        confirmLabel="Desactivar"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
