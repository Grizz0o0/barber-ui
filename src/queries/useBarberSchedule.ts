import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request as http } from '@/lib/api'
import type { SuccessResponse } from '@/types'

export interface BarberSchedule {
  _id: string
  barber: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
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
