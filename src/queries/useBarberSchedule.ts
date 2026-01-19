import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request as http } from '@/lib/api'
import type { SuccessResponse } from '@/types'

export interface BarberSchedule {
  _id: string
  barber: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  isDayOff?: boolean
}

type GetBarberScheduleParams = {
  barber?: string
  dayOfWeek?: number
}

const BARBER_SCHEDULE_QUERY_KEY = 'barberSchedules'

export const useGetBarberSchedules = (params?: GetBarberScheduleParams) => {
  return useQuery({
    queryKey: [BARBER_SCHEDULE_QUERY_KEY, params],
    queryFn: () => http.get<SuccessResponse<{ schedules: BarberSchedule[] }>>('barber-schedules', params)
  })
}

export const useCreateBarberSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<BarberSchedule>) => http.post<SuccessResponse<BarberSchedule>>('barber-schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BARBER_SCHEDULE_QUERY_KEY] })
    }
  })
}

export const useUpdateBarberSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BarberSchedule> }) =>
      http.patch<SuccessResponse<BarberSchedule>>(`barber-schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BARBER_SCHEDULE_QUERY_KEY] })
    }
  })
}
