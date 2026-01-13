import serviceApiRequest from '@/apiRequests/service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateServiceItemReqBody, UpdateServiceItemReqBody } from '@/lib/schemas/service.schema'

export const useGetServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApiRequest.getServices()
  })
}

export const useGetService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => serviceApiRequest.getService(id),
    enabled: !!id
  })
}

export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateServiceItemReqBody) => serviceApiRequest.createService(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceItemReqBody }) =>
      serviceApiRequest.updateService(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => serviceApiRequest.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}
