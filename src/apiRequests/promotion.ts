import { request } from '@/lib/api'
import type { CreatePromotionReqBody, UpdatePromotionReqBody } from '@/lib/schemas/promotion.schema'

export const promotionApiRequest = {
  createPromotion: (body: CreatePromotionReqBody) => request.post('/promotions', body),
  getPromotions: () => request.get('/promotions'),
  getPromotion: (id: string) => request.get(`/promotions/${id}`),
  updatePromotion: (id: string, body: UpdatePromotionReqBody) => request.patch(`/promotions/${id}`, body),
  deletePromotion: (id: string) => request.delete(`/promotions/${id}`)
}

export default promotionApiRequest
