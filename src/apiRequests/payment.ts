import { request } from '@/lib/api'

export const paymentApiRequest = {
  createMomoPayment: (body: { amount: number; orderInfo: string; orderId?: string; bookingId?: string }) =>
    request.post('/payments/momo', body),
  getPayments: (page = 1, limit = 10) => request.get('/payments', { page, limit }),
  getPayment: (id: string) => request.get(`/payments/${id}`),
  getPaymentByTransactionId: (transactionId: string) => request.get(`/payments/transaction/${transactionId}`),
  updatePaymentStatus: (id: string, status: string) => request.patch(`/payments/${id}/status`, { status })
}

export default paymentApiRequest
