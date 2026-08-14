import { useState, useEffect, useCallback } from 'react'
import { useClientStore } from '../store'
import type { ClientFormData } from '../validations'
import type { Client } from '../types'

export function useClients() {
  const {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    deactivateClient,
    getClientById,
  } = useClientStore()

  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null)

  useEffect(() => {
    if (clients.length === 0) fetchClients()
  }, [clients.length, fetchClients])

  const createClient = useCallback(
    async (data: ClientFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        await addClient(data)
        return { success: true }
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Error al registrar cliente' }
      }
    },
    [addClient]
  )

  const editClient = useCallback(
    async (id: string, data: ClientFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        await updateClient(id, data)
        return { success: true }
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar cliente' }
      }
    },
    [updateClient]
  )

  const handleDeactivate = useCallback(
    async (id: string) => {
      try {
        await deactivateClient(id)
      } catch {
        // error handled in store
      }
      setConfirmDeactivateId(null)
    },
    [deactivateClient]
  )

  const getClient = useCallback((id: string): Client | undefined => getClientById(id), [getClientById])

  return {
    clients,
    loading,
    error,
    createClient,
    editClient,
    handleDeactivate,
    confirmDeactivateId,
    setConfirmDeactivateId,
    getClient,
  }
}
