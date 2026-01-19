import aiApiRequest, { type HairConsultationRequest } from '@/apiRequests/ai'
import { useMutation } from '@tanstack/react-query'

export const useConsultAI = () => {
  return useMutation({
    mutationFn: (body: HairConsultationRequest) => aiApiRequest.consult(body)
  })
}
