import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetBarberSchedules, type BarberSchedule } from '@/queries/useBarberSchedule'
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ViewScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barberId: string | null
  barberName: string
}

// Helper to get current week days (Mon-Sun)
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

const ViewScheduleDialog = ({ open, onOpenChange, barberId, barberName }: ViewScheduleDialogProps) => {
  const { data, isLoading } = useGetBarberSchedules({ barber: barberId || undefined })
  const schedules = data?.metadata?.schedules || []

  const getScheduleForDay = (dayIndex: number) => {
    return schedules.find((s: BarberSchedule) => s.dayOfWeek === dayIndex)
  }

  const displayDates = getCurrentWeekDays()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CalendarIcon className='w-5 h-5' />
            Lịch làm việc: {barberName}
          </DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          {isLoading ? (
            <div className='flex justify-center p-8'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
          ) : (
            <div className='space-y-3'>
              {displayDates.map((date, index) => {
                const dayIndex = date.getDay()
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' })
                const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                const schedule = getScheduleForDay(dayIndex)

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      schedule
                        ? 'bg-card border-border shadow-sm'
                        : 'bg-muted/30 border-transparent text-muted-foreground'
                    }`}
                  >
                    <div className='flex flex-col'>
                      <span className='font-medium text-sm capitalize'>{dayName}</span>
                      <span className='text-xs text-muted-foreground'>{dateStr}</span>
                    </div>
                    {schedule ? (
                      <div className='flex items-center gap-2 text-sm font-medium text-primary'>
                        <Clock className='w-4 h-4' />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    ) : (
                      <Badge variant='outline' className='text-muted-foreground font-normal'>
                        Nghỉ
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewScheduleDialog
