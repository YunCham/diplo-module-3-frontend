export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  productId: string
  amount: number
  unitPrice: number
  subTotal: number
  productName?: string
}

export interface OrderFormItem {
  productId: string
  productName: string
  amount: number
  unitPrice: number
}

export interface Order {
  id: string
  customerId: string
  status: OrderStatus
  total: number
  items?: OrderItem[]
  createdAt: string
  customerName?: string
}
