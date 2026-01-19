import statisticApiRequest from '@/apiRequests/statistic'
import { useQuery, useMutation } from '@tanstack/react-query'

export const useGetDashboardStats = (period = 'month') => {
  return useQuery({
    queryKey: ['statistics', period],
    queryFn: () => statisticApiRequest.getDashboardStats(period)
  })
}

export const useExportRevenue = () => {
  return useMutation({
    mutationFn: statisticApiRequest.exportRevenue
  })
}
