import { Clock, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, formatDuration } from '@/lib/constants'
import type { Service } from '@/types'

interface BookingServiceStepProps {
  services: Service[]
  selectedService: string | null
  onSelectService: (id: string) => void
}

const BookingServiceStep = ({ services, selectedService, onSelectService }: BookingServiceStepProps) => {
  return (
    <div className='animate-fade-in'>
      <h2 className='text-center mb-8'>
        Chọn <span className='text-gradient'>dịch vụ</span>
      </h2>
      <div className='grid gap-4'>
        {services.map((service) => (
          <div
            key={service._id}
            onClick={() => onSelectService(service._id)}
            className={cn(
              'p-4 rounded-xl border cursor-pointer transition-all',
              selectedService === service._id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            )}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                  <Scissors className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h3 className='font-semibold text-foreground'>{service.name}</h3>
                  <p className='text-muted-foreground text-sm flex items-center gap-1'>
                    <Clock className='w-3 h-3' /> {formatDuration(service.duration)}
                  </p>
                </div>
              </div>
              <p className='text-primary font-bold'>{formatPrice(service.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingServiceStep
