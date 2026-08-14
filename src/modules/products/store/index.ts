import { create } from 'zustand'
import type { Product } from '../types'
import { productsApi } from '../../../shared/api'

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (data: { name: string; description?: string; price: number; stock: number }) => Promise<Product>
  updateProduct: (id: string, data: { name?: string; description?: string; price?: number; stock?: number }) => Promise<void>
  deactivateProduct: (id: string) => Promise<void>
  getActiveProducts: () => Product[]
  getProductById: (id: string) => Product | undefined
  hasSufficientStock: (productId: string, quantity: number) => boolean
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const products = await productsApi.getAll()
      set({ products, loading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar productos'
      set({ error: msg, loading: false })
    }
  },

  addProduct: async (data) => {
    const newProduct = await productsApi.create(data)
    set((state) => ({ products: [...state.products, newProduct] }))
    return newProduct
  },

  updateProduct: async (id, data) => {
    await productsApi.update(id, data)
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },

  deactivateProduct: async (id) => {
    const updated = await productsApi.deactivate(id)
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p)),
    }))
  },

  getActiveProducts: () => get().products.filter((p) => p.isActive),

  getProductById: (id) => get().products.find((p) => p.id === id),

  hasSufficientStock: (productId, quantity) => {
    const product = get().products.find((p) => p.id === productId)
    return product ? product.stock >= quantity : false
  },
}))
