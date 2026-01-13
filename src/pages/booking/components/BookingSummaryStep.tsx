import { format } from 'date-fns'
import { formatPrice, formatDuration } from '@/lib/constants'
import type { Service, User } from '@/types'

// Use simpler local interfaces if mostly for display and to avoid generic clutter,
// but sharing types is better. Let's assume passed props are well typed.

interface BookingSummaryStepProps {
  selectedServiceData: Service | undefined
  selectedBarberData: User | undefined
  selectedDate: Date | undefined
  selectedTime: string | null
  notes: string
}

const BookingSummaryStep = ({
  selectedServiceData,
  selectedBarberData,
  selectedDate,
  selectedTime,
  notes
}: BookingSummaryStepProps) => {
  return (
    <div className='animate-fade-in'>
      <h2 className='text-center mb-8'>
        Xác nhận <span className='text-gradient'>đặt lịch</span>
      </h2>
      <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Dịch vụ</span>
          <span className='font-semibold text-foreground'>{selectedServiceData?.name}</span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Thợ cắt</span>
          <span className='font-semibold text-foreground'>{selectedBarberData?.name}</span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Ngày giờ</span>
          <span className='font-semibold text-foreground'>
            {selectedDate && format(selectedDate, 'dd/MM/yyyy')} - {selectedTime}
          </span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Thời lượng</span>
          <span className='font-semibold text-foreground'>
            {selectedServiceData && formatDuration(selectedServiceData.duration)}
          </span>
        </div>
        {notes && (
          <div className='flex items-center justify-between py-3 border-b border-border'>
            <span className='text-muted-foreground'>Ghi chú</span>
            <span className='font-semibold text-foreground'>{notes}</span>
          </div>
        )}
        <div className='flex items-center justify-between py-3'>
          <span className='text-muted-foreground'>Tổng tiền</span>
          <span className='text-primary font-bold text-xl'>
            {selectedServiceData && formatPrice(selectedServiceData.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookingSummaryStep
