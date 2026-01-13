import { request } from '@/lib/api'
import type { CreateBarberScheduleReqBody, UpdateBarberScheduleReqBody } from '@/lib/schemas/barberSchedule.schema'

export const barberScheduleApiRequest = {
  createSchedule: (body: CreateBarberScheduleReqBody) => request.post('/barber-schedules', body),
  getSchedules: (barberId: string, date: string) => request.get('/barber-schedules', { barber: barberId, date }),
  getSchedule: (id: string) => request.get(`/barber-schedules/${id}`),
  updateSchedule: (id: string, body: UpdateBarberScheduleReqBody) => request.patch(`/barber-schedules/${id}`, body),
  deleteSchedule: (id: string) => request.delete(`/barber-schedules/${id}`)
}

export default barberScheduleApiRequest
