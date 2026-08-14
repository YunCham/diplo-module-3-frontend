import { useState, useEffect, useCallback } from 'react'
import { useProductStore } from '../store'
import type { ProductFormData } from '../validations'
import type { Product } from '../types'

export function useProducts() {
  const {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deactivateProduct,
    getProductById: getById,
  } = useProductStore()

  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null)

  useEffect(() => {
    if (products.length === 0) fetchProducts()
  }, [products.length, fetchProducts])

  const createProduct = useCallback(
    async (data: ProductFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        await addProduct(data)
        return { success: true }
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Error al registrar producto' }
      }
    },
    [addProduct]
  )

  const editProduct = useCallback(
    async (id: string, data: ProductFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        await updateProduct(id, data)
        return { success: true }
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar producto' }
      }
    },
    [updateProduct]
  )

  const handleDeactivate = useCallback(
    async (id: string) => {
      try {
        await deactivateProduct(id)
      } catch {
        // error handled in store
      }
      setConfirmDeactivateId(null)
    },
    [deactivateProduct]
  )

  const getProductById = useCallback((id: string): Product | undefined => getById(id), [getById])

  return {
    products,
    loading,
    error,
    createProduct,
    editProduct,
    handleDeactivate,
    confirmDeactivateId,
    setConfirmDeactivateId,
    getProductById,
  }
}
