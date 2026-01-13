import { request } from '@/lib/api'
import type { CreateReviewReqBody, UpdateReviewReqBody, ReplyReviewReqBody } from '@/lib/schemas/review.schema'

export const reviewApiRequest = {
  getReviews: (page = 1, limit = 10) => request.get('/reviews', { page, limit }),
  createReview: (body: CreateReviewReqBody) => request.post('/reviews', body),
  updateReview: (id: string, body: UpdateReviewReqBody) => request.patch(`/reviews/${id}`, body),
  deleteReview: (id: string) => request.delete(`/reviews/${id}`),
  replyReview: (id: string, body: ReplyReviewReqBody) => request.post(`/reviews/${id}/reply`, body)
}

export default reviewApiRequest
