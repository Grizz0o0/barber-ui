import systemConfigApiRequest from '@/apiRequests/systemConfig'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SystemConfig } from '@/types'

export const useGetSystemConfig = () => {
  return useQuery({
    queryKey: ['system-configs'],
    queryFn: () => systemConfigApiRequest.getConfig()
  })
}

export const useUpdateSystemConfigMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<SystemConfig>) => systemConfigApiRequest.updateConfig(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-configs'] })
    }
  })
}
