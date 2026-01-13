import barberScheduleApiRequest from '@/apiRequests/barberSchedule'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateBarberScheduleReqBody, UpdateBarberScheduleReqBody } from '@/lib/schemas/barberSchedule.schema'

export const useGetSchedules = (barberId: string, date: string) => {
  return useQuery({
    queryKey: ['barber-schedules', barberId, date],
    queryFn: () => barberScheduleApiRequest.getSchedules(barberId, date),
    enabled: !!barberId && !!date
  })
}

export const useGetSchedule = (id: string) => {
  return useQuery({
    queryKey: ['barber-schedules', id],
    queryFn: () => barberScheduleApiRequest.getSchedule(id),
    enabled: !!id
  })
}

export const useCreateScheduleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBarberScheduleReqBody) => barberScheduleApiRequest.createSchedule(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-schedules'] })
    }
  })
}

export const useUpdateScheduleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBarberScheduleReqBody }) =>
      barberScheduleApiRequest.updateSchedule(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-schedules'] })
    }
  })
}

export const useDeleteScheduleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => barberScheduleApiRequest.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-schedules'] })
    }
  })
}
