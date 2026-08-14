import { create } from 'zustand'
import type { Client } from '../types'
import { clientsApi } from '../../../shared/api'

interface ClientStore {
  clients: Client[]
  loading: boolean
  error: string | null
  fetchClients: () => Promise<void>
  addClient: (data: { fullName: string; email: string; phone?: string }) => Promise<Client>
  updateClient: (id: string, data: { fullName?: string; email?: string; phone?: string }) => Promise<void>
  deactivateClient: (id: string) => Promise<void>
  getActiveClients: () => Client[]
  getClientById: (id: string) => Client | undefined
}

export const useClientStore = create<ClientStore>()((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const clients = await clientsApi.getAll()
      set({ clients, loading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar clientes'
      set({ error: msg, loading: false })
    }
  },

  addClient: async (data) => {
    const newClient = await clientsApi.create(data)
    set((state) => ({ clients: [...state.clients, newClient] }))
    return newClient
  },

  updateClient: async (id, data) => {
    await clientsApi.update(id, data)
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }))
  },

  deactivateClient: async (id) => {
    const updated = await clientsApi.deactivate(id)
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? updated : c)),
    }))
  },

  getActiveClients: () => get().clients.filter((c) => c.isActive),

  getClientById: (id) => get().clients.find((c) => c.id === id),
}))
