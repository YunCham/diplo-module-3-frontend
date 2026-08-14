import { z } from 'zod'

export const clientSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre completo es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('El email no es válido'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]{7,20}$/.test(val),
      'El teléfono no es válido'
    ),
})

export type ClientFormData = z.infer<typeof clientSchema>
