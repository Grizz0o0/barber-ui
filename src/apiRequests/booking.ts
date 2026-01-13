import { request } from '@/lib/api'
import type {
  CreateBookingReqBody,
  UpdateBookingReqBody,
  GetBookingQuery,
  EmergencyActionReqBody
} from '@/lib/schemas/booking.schema'

export const bookingApiRequest = {
  createBooking: (body: CreateBookingReqBody) => request.post('/bookings', body),
  getBookings: (params?: GetBookingQuery) => request.get('/bookings', params as Record<string, any>),
  getBooking: (id: string) => request.get(`/bookings/${id}`),
  updateBooking: (id: string, body: UpdateBookingReqBody) => request.patch(`/bookings/${id}`, body),
  deleteBooking: (id: string) => request.delete(`/bookings/${id}`),
  handleEmergency: (body: EmergencyActionReqBody) => request.post('/bookings/emergency', body)
}

export default bookingApiRequest
