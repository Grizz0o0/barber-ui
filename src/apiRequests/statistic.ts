import { request } from '@/lib/api'

export const statisticApiRequest = {
  getDashboardStats: (period = 'month') => request.get('/statistics', { period })
}

export default statisticApiRequest
