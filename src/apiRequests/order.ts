import { request } from '@/lib/api'
import type { CreateOrderReqBody, UpdateOrderReqBody } from '@/lib/schemas/order.schema'

export const orderApiRequest = {
  createOrder: (body: CreateOrderReqBody) => request.post('/orders', body),
  getOrders: (params?: any) => request.get('/orders', { params }),
  getOrder: (id: string) => request.get(`/orders/${id}`),
  updateOrder: (id: string, body: UpdateOrderReqBody) => request.patch(`/orders/${id}`, body),
  deleteOrder: (id: string) => request.delete(`/orders/${id}`)
}

export default orderApiRequest
