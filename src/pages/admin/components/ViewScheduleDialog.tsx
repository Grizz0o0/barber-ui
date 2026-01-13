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

const DAYS_OF_WEEK = [
  'Chủ Nhật', // 0
  'Thứ 2', // 1
  'Thứ 3', // 2
  'Thứ 4', // 3
  'Thứ 5', // 4
  'Thứ 6', // 5
  'Thứ 7' // 6
]

const ViewScheduleDialog = ({ open, onOpenChange, barberId, barberName }: ViewScheduleDialogProps) => {
  const { data, isLoading } = useGetBarberSchedules({ barber: barberId || undefined })
  const schedules = data?.data?.schedules || []

  // Helper to find schedule for a specific day index (0-6)
  const getScheduleForDay = (dayIndex: number) => {
    return schedules.find((s: BarberSchedule) => s.dayOfWeek === dayIndex)
  }

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
              {DAYS_OF_WEEK.map((dayName, index) => {
                const schedule = getScheduleForDay(index)
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      schedule
                        ? 'bg-card border-border shadow-sm'
                        : 'bg-muted/30 border-transparent text-muted-foreground'
                    }`}
                  >
                    <span className='font-medium text-sm'>{dayName}</span>
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
