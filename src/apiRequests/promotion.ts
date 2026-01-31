import { request } from '@/lib/api'
import type { CreatePromotionReqBody, UpdatePromotionReqBody } from '@/lib/schemas/promotion.schema'

export const promotionApiRequest = {
  createPromotion: (body: CreatePromotionReqBody) => request.post('/promotions', body),
  getPromotions: () => request.get<any>('/promotions'),
  getPromotion: (id: string) => request.get<any>(`/promotions/${id}`),
  updatePromotion: (id: string, body: UpdatePromotionReqBody) => request.patch<any>(`/promotions/${id}`, body),
  deletePromotion: (id: string) => request.delete<any>(`/promotions/${id}`),
  verifyPromotion: (body: { code: string; amount: number; context: 'product' | 'service' | 'all' }) =>
    request.post<any>('/promotions/verify', body)
}

export default promotionApiRequest
