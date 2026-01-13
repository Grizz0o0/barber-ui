import statisticApiRequest from '@/apiRequests/statistic'
import { useQuery } from '@tanstack/react-query'

export const useGetDashboardStats = (period = 'month') => {
  return useQuery({
    queryKey: ['statistics', period],
    queryFn: () => statisticApiRequest.getDashboardStats(period)
  })
}
