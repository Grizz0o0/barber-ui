import orderApiRequest from '@/apiRequests/order'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateOrderReqBody, UpdateOrderReqBody } from '@/lib/schemas/order.schema'

import type { GetOrderQuery } from '@/lib/schemas/order.schema'

export const useGetOrders = (params?: GetOrderQuery, enabled = true) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApiRequest.getOrders(params),
    enabled
  })
}

export const useGetOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApiRequest.getOrder(id),
    enabled: !!id && enabled
  })
}

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderReqBody) => orderApiRequest.createOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderReqBody }) => orderApiRequest.updateOrder(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApiRequest.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
