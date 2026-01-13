import paymentApiRequest from '@/apiRequests/payment'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetPayments = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['payments', page, limit],
    queryFn: () => paymentApiRequest.getPayments(page, limit)
  })
}

export const useGetPayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentApiRequest.getPayment(id),
    enabled: !!id
  })
}

export const useCreateMomoPaymentMutation = () => {
  return useMutation({
    mutationFn: (body: { amount: number; orderInfo: string; orderId: string }) =>
      paymentApiRequest.createMomoPayment(body)
  })
}

export const useUpdatePaymentStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => paymentApiRequest.updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}
