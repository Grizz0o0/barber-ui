import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetBarberSchedules,
  useCreateBarberSchedule,
  useUpdateBarberSchedule,
  type BarberSchedule
} from '@/queries/useBarberSchedule'
import { toast } from 'sonner'
import { Calendar, Save, Loader2, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const generateTimeSlots = () => {
  const slots = []
  for (let i = 7; i <= 22; i++) {
    const hour = i.toString().padStart(2, '0')
    slots.push(`${hour}:00`)
    slots.push(`${hour}:30`)
  }
  return slots
}

const getCurrentWeekDays = () => {
  const dates = []
  const today = new Date()
  const currentDay = today.getDay()

  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1

  const monday = new Date(today)
  monday.setDate(today.getDate() - daysToMonday)

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

const TIME_SLOTS = generateTimeSlots()

const BarberSchedulePage = () => {
  const { user } = useAuth()
  const { data: scheduleData, isLoading } = useGetBarberSchedules({ barber: user?._id })
  const createSchedule = useCreateBarberSchedule()
  const updateSchedule = useUpdateBarberSchedule()

  const [schedules, setSchedules] = useState<Partial<BarberSchedule>[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const weekDays = getCurrentWeekDays()

    const mapped = weekDays.map((date) => {
      const dayOfWeek = date.getDay()

      const existing = scheduleData?.metadata?.schedules?.find((s) => s.dayOfWeek === dayOfWeek)

      if (existing) {
        return existing
      }

      return {
        barber: user?._id || '',
        dayOfWeek: dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isDayOff: true
      } as BarberSchedule
    })

    setSchedules(mapped)
  }, [scheduleData, isLoading, user])

  const handleDayChange = (index: number, field: keyof BarberSchedule | 'isDayOff', value: any) => {
    const newSchedules = [...schedules]
    newSchedules[index] = { ...newSchedules[index], [field]: value }
    setSchedules(newSchedules)
  }

  const handleSave = async () => {
    if (!user?._id) return

    setIsSaving(true)
    try {
      const promises = schedules.map(async (schedule) => {
        // Ensure barber ID is present
        const payload = { ...schedule, barber: schedule.barber || user._id }

        if (payload._id) {
          return updateSchedule.mutateAsync({ id: payload._id, data: payload })
        } else {
          return createSchedule.mutateAsync(payload)
        }
      })

      await Promise.all(promises)
      toast.success('Đã lưu lịch làm việc')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi lưu lịch')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='max-w-4xl mx-auto p-6 lg:p-8 space-y-8'>
      <div>
        <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý lịch làm việc</h1>
        <p className='text-muted-foreground'>Thiết lập thời gian làm việc trong tuần của bạn.</p>
      </div>

      <Card className='bg-card/50 border-border/50'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-primary' />
            Lịch tuần này
          </CardTitle>
          <Button onClick={handleSave} disabled={isSaving} variant='gold' size='sm'>
            {isSaving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
            Lưu thay đổi
          </Button>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-4 px-4 font-medium text-muted-foreground w-50'>Thứ</th>
                  <th className='text-left py-4 px-4 font-medium text-muted-foreground w-50'>Trạng thái</th>
                  <th className='text-left py-4 px-4 font-medium text-muted-foreground'>Giờ làm việc</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => {
                  const displayDates = getCurrentWeekDays()
                  const date = displayDates[index]
                  if (!date) return null

                  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' })
                  const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                  const isDayOff = schedule.isDayOff

                  return (
                    <tr key={`${schedule.dayOfWeek}-${index}`} className='border-b border-border/50 hover:bg-muted/30'>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex flex-col'>
                            <span className='font-medium capitalize'>{dayName}</span>
                            <span className='text-xs text-muted-foreground'>{dateStr}</span>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-2'>
                          <Switch
                            checked={!isDayOff}
                            onCheckedChange={(checked) => handleDayChange(index, 'isDayOff', !checked)}
                          />
                          <span
                            className={`text-sm ${isDayOff ? 'text-muted-foreground' : 'text-green-600 font-medium'}`}
                          >
                            {isDayOff ? 'Nghỉ' : 'Làm việc'}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        {!isDayOff ? (
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                              <Clock className='w-4 h-4 text-muted-foreground' />
                              <Select
                                value={schedule.startTime}
                                onValueChange={(val) => handleDayChange(index, 'startTime', val)}
                              >
                                <SelectTrigger className='w-25 h-9'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='max-h-50'>
                                  {TIME_SLOTS.map((t) => (
                                    <SelectItem key={`start-${t}`} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <span className='text-muted-foreground'>-</span>
                            <div className='flex items-center gap-2'>
                              <Select
                                value={schedule.endTime}
                                onValueChange={(val) => handleDayChange(index, 'endTime', val)}
                              >
                                <SelectTrigger className='w-25 h-9'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='max-h-50'>
                                  {TIME_SLOTS.map((t) => (
                                    <SelectItem key={`end-${t}`} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <span className='text-muted-foreground text-sm italic'>Không có lịch</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BarberSchedulePage
