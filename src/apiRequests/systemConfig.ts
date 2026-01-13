import { request } from '@/lib/api'
import type { SystemConfig } from '@/types'

export const systemConfigApiRequest = {
  getConfig: () => request.get('/system-configs'),
  updateConfig: (body: Partial<SystemConfig>) => request.patch('/system-configs', body)
}

export default systemConfigApiRequest
