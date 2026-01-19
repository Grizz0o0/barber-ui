import { request as http } from '@/lib/api'
import type { SuccessResponse } from '@/types'

export interface HairConsultationRequest {
  faceShape: string
  hairType: string
  currentLength: string
  desiredStyle: string
}

export interface Recommendation {
  name: string
  description: string
  stylingTips: string
}

export interface AIResponse {
  recommendations: Recommendation[]
}

const aiApiRequest = {
  consult: (body: HairConsultationRequest) => http.post<SuccessResponse<AIResponse>>('/ai/consult', body),
  chat: (body: { message: string; history: any[] }) => http.post<SuccessResponse<{ message: string }>>('/ai/chat', body)
}

export default aiApiRequest
