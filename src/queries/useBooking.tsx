import bookingApiRequest from '@/apiRequests/booking'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateBookingReqBody,
  UpdateBookingReqBody,
  GetBookingQuery,
  EmergencyActionReqBody
} from '@/lib/schemas/booking.schema'

export const useGetBookings = (params?: GetBookingQuery, enabled = true) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApiRequest.getBookings(params),
    enabled
  })
}

export const useGetBooking = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingApiRequest.getBooking(id),
    enabled: !!id && enabled
  })
}

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBookingReqBody) => bookingApiRequest.createBooking(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export const useUpdateBookingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBookingReqBody }) => bookingApiRequest.updateBooking(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export const useDeleteBookingMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApiRequest.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export const useHandleEmergencyMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: EmergencyActionReqBody) => bookingApiRequest.handleEmergency(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}
