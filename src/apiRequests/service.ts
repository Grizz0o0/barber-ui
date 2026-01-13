import { request } from '@/lib/api'
import type { CreateServiceItemReqBody, UpdateServiceItemReqBody } from '@/lib/schemas/service.schema'

export const serviceApiRequest = {
  getServices: () => request.get('/services'),
  getService: (id: string) => request.get(`/services/${id}`),
  createService: (body: CreateServiceItemReqBody) => request.post('/services', body),
  updateService: (id: string, body: UpdateServiceItemReqBody) => request.patch(`/services/${id}`, body),
  deleteService: (id: string) => request.delete(`/services/${id}`)
}

export default serviceApiRequest
