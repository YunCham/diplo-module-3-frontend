import { Badge } from '../../../shared/components/Badge'
import { getOrderStatusColor, getOrderStatusLabel } from '../../../shared/utils'
import type { OrderStatus } from '../types'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge className={getOrderStatusColor(status)}>{getOrderStatusLabel(status)}</Badge>
}
