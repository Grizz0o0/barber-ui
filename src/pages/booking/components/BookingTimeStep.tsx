import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Loader2, Banknote, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { timeSlots, PaymentMethod } from '@/lib/constants'

interface BookingTimeStepProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  notes: string
  onNotesChange: (value: string) => void
  paymentMethod: string
  onPaymentMethodChange: (value: string) => void
  selectedTime: string | null
  onSelectTime: (time: string) => void
  disabledTimeSlots: string[]
  isCheckingAvailability: boolean
}

const BookingTimeStep = ({
  selectedDate,
  onSelectDate,
  notes,
  onNotesChange,
  paymentMethod,
  onPaymentMethodChange,
  selectedTime,
  onSelectTime,
  disabledTimeSlots,
  isCheckingAvailability
}: BookingTimeStepProps) => {
  return (
    <div className='animate-fade-in'>
      <h2 className='text-center mb-8'>
        Chọn <span className='text-gradient'>ngày giờ</span>
      </h2>
      <div className='grid md:grid-cols-2 gap-8'>
        {/* Date */}
        <div>
          <label className='block text-sm font-medium mb-2'>Ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal h-12',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {selectedDate ? format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={onSelectDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className='pointer-events-auto'
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Notes */}
        <div>
          <label className='block text-sm font-medium mb-2'>Ghi chú (tùy chọn)</label>
          <Textarea
            placeholder='Kiểu tóc mong muốn, yêu cầu đặc biệt...'
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className='bg-secondary border-border h-12 min-h-12'
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className='mt-8'>
        <h3 className='text-sm font-medium mb-3'>Phương thức thanh toán</h3>
        <RadioGroup
          value={paymentMethod}
          onValueChange={onPaymentMethodChange}
          className='grid grid-cols-1 sm:grid-cols-2 gap-4'
        >
          <label
            htmlFor='store'
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === PaymentMethod.CASH
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value={PaymentMethod.CASH} id='store' />
            <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500'>
              <Banknote className='w-5 h-5' />
            </div>
            <div>
              <p className='font-medium'>Tại cửa hàng</p>
              <p className='text-xs text-muted-foreground'>Thanh toán sau khi cắt xong</p>
            </div>
          </label>

          <label
            htmlFor='momo'
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === PaymentMethod.MOMO
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value={PaymentMethod.MOMO} id='momo' />
            <div className='w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500'>
              <Smartphone className='w-5 h-5' />
            </div>
            <div>
              <p className='font-medium'>Ví MoMo</p>
              <p className='text-xs text-muted-foreground'>Thanh toán online ngay bây giờ</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Time Slots */}
      <div className='mt-6'>
        <div className='flex items-center justify-between mb-3'>
          <label className='block text-sm font-medium'>Giờ</label>
          {isCheckingAvailability && (
            <span className='text-xs text-primary flex items-center animate-pulse'>
              <Loader2 className='w-3 h-3 mr-1 animate-spin' />
              Đang kiểm tra lịch trống...
            </span>
          )}
        </div>
        <div className='grid grid-cols-4 sm:grid-cols-6 gap-2'>
          {timeSlots.map((time) => {
            const isDisabled = disabledTimeSlots.includes(time)
            return (
              <Button
                key={time}
                variant={selectedTime === time ? 'gold' : 'outline'}
                size='sm'
                onClick={() => !isDisabled && onSelectTime(time)}
                disabled={isDisabled}
                className={cn(
                  'h-10 transition-all',
                  isDisabled && 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                )}
              >
                {time}
              </Button>
            )
          })}
        </div>
        {disabledTimeSlots.length > 0 && (
          <p className='text-xs text-muted-foreground mt-2 italic'>* Các khung giờ bị mờ là đã được đặt kín.</p>
        )}
      </div>
    </div>
  )
}

export default BookingTimeStep
