import { request } from '@/lib/api'

export const statisticApiRequest = {
  getDashboardStats: (period = 'month') => request.get('/statistics', { period }),
  exportRevenue: () =>
    request.get('/statistics/export', undefined, {
      responseType: 'blob'
    })
}

export default statisticApiRequest
