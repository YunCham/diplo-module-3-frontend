import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '../validations'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import type { Product } from '../types'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  initialData?: Product
  isLoading?: boolean
}

export function ProductForm({ onSubmit, onCancel, initialData, isLoading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: initialData.price,
          stock: initialData.stock,
        }
      : { name: '', description: '', price: 0, stock: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Nombre del producto"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nombre del producto"
        required
      />
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          className="block w-full rounded-md border border-gray-300 dark:border-brand/30 bg-white dark:bg-brand-deep/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/30 dark:text-gray-100"
          placeholder="Descripción del producto (opcional)"
          {...register('description')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio"
          type="number"
          step="0.01"
          min="0.01"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
          placeholder="0.00"
          required
        />
        <Input
          label="Stock"
          type="number"
          step="1"
          min="0"
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
          placeholder="0"
          required
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Registrar'} Producto
        </Button>
      </div>
    </form>
  )
}
