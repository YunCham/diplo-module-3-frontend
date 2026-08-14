import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const generateId = (): string => uuidv4()

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es })
}

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'bg-gold/15 text-gold-dark',
    CONFIRMED: 'bg-brand/15 text-brand-deep',
    DELIVERED: 'bg-mint-dark/15 text-mint-dark',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

export const getStockColor = (stock: number): string => {
  if (stock === 0) return 'text-red-600 font-bold'
  if (stock <= 5) return 'text-orange-500 font-semibold'
  return 'text-green-600'
}
