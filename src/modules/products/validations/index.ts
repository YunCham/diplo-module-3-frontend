import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del producto es obligatorio')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  description: z.string().optional(),
  price: z
    .number({ required_error: 'El precio es obligatorio', invalid_type_error: 'El precio debe ser numérico' })
    .positive('El precio debe ser mayor a 0'),
  stock: z
    .number({ required_error: 'El stock es obligatorio', invalid_type_error: 'El stock debe ser numérico' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
})

export type ProductFormData = z.infer<typeof productSchema>
