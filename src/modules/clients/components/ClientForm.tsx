import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormData } from '../validations'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import type { Client } from '../types'

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void
  onCancel: () => void
  initialData?: Client
  isLoading?: boolean
}

export function ClientForm({ onSubmit, onCancel, initialData, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData
      ? { fullName: initialData.fullName, email: initialData.email, phone: initialData.phone }
      : { fullName: '', email: '', phone: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Nombre completo"
        {...register('fullName')}
        error={errors.fullName?.message}
        placeholder="Ingrese el nombre completo"
        required
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="correo@ejemplo.com"
        required
      />
      <Input
        label="Teléfono"
        {...register('phone')}
        error={errors.phone?.message}
        placeholder="555-123-4567"
      />
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Registrar'} Cliente
        </Button>
      </div>
    </form>
  )
}
