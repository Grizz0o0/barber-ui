import { request } from '@/lib/api'
import type { updateMeReqBodyType, PaginationParamsInputType, CreateUserReqBody } from '@/lib/schemas/user.schema'
import type { changePasswordReqBodyType } from '@/lib/schemas/auth.schema'

export interface UpdateUserReqBody {
  name?: string
  email?: string
  phone?: string
  role?: string
  isActive?: boolean
  avatar?: string
}

const accountApiRequest = {
  me: () => request.get('/users/me'),
  updateMe: (body: updateMeReqBodyType) => request.patch('/users/me', body),
  changePassword: (body: changePasswordReqBodyType) => request.post('/auth/change-password', body),
  getListUser: (params: PaginationParamsInputType) => request.get('/users', params as any),

  getBarbers: () => request.get('/users/barbers'),
  getUser: (id: string) => request.get(`/users/${id}`),
  createUser: (body: CreateUserReqBody) => request.post('/users', body),
  updateUser: (id: string, body: UpdateUserReqBody) => request.patch(`/users/${id}`, body),
  deleteUser: (id: string) => request.delete(`/users/${id}`)
}

export default accountApiRequest
