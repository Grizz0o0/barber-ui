import promotionApiRequest from '@/apiRequests/promotion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreatePromotionReqBody, UpdatePromotionReqBody } from '@/lib/schemas/promotion.schema'

export const useGetPromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionApiRequest.getPromotions()
  })
}

export const useGetPromotion = (id: string) => {
  return useQuery({
    queryKey: ['promotions', id],
    queryFn: () => promotionApiRequest.getPromotion(id),
    enabled: !!id
  })
}

export const useCreatePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePromotionReqBody) => promotionApiRequest.createPromotion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}

export const useUpdatePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePromotionReqBody }) =>
      promotionApiRequest.updatePromotion(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}

export const useDeletePromotionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => promotionApiRequest.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
    }
  })
}
