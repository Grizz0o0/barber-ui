import reviewApiRequest from '@/apiRequests/review'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateReviewReqBody, UpdateReviewReqBody, ReplyReviewReqBody } from '@/lib/schemas/review.schema'

export const useGetReviews = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['reviews', page, limit],
    queryFn: () => reviewApiRequest.getReviews(page, limit)
  })
}

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReviewReqBody) => reviewApiRequest.createReview(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReviewReqBody }) => reviewApiRequest.updateReview(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewApiRequest.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export const useReplyReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReplyReviewReqBody }) => reviewApiRequest.replyReview(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}
