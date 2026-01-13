import { Star, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import type { User } from '@/types'

// Accessing specific properties that might be optional in User but we expect for Barber
interface Barber extends User {
  rating?: number
  experience?: number
  specialty?: string
}

interface BookingBarberStepProps {
  barbers: Barber[]
  selectedBarber: string | null
  onSelectBarber: (id: string) => void
}

const getPseudoRandomNumber = (seed: string, min: number, max: number) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return min + (Math.abs(hash) % (max - min + 1))
}

const BookingBarberStep = ({ barbers, selectedBarber, onSelectBarber }: BookingBarberStepProps) => {
  return (
    <div className='animate-fade-in'>
      <h2 className='text-center mb-8'>
        Chọn <span className='text-gradient'>thợ cắt</span>
      </h2>
      <div className='grid md:grid-cols-3 gap-4'>
        {barbers.map((barber) => (
          <div
            key={barber._id}
            className={cn(
              'relative p-6 rounded-xl border transition-all text-center flex flex-col items-center justify-between',
              selectedBarber === barber._id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            )}
          >
            {/* Barber Selection Area */}
            <div className='flex-1 w-full cursor-pointer' onClick={() => onSelectBarber(barber._id)}>
              <div className='relative inline-block mb-4'>
                <img
                  src={barber.avatar || 'https://github.com/shadcn.png'}
                  alt={barber.name}
                  className='w-20 h-20 rounded-full mx-auto border-2 border-primary object-cover'
                />
                <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1'>
                  <Star className='w-3 h-3 fill-current' />
                  {barber.rating || '5.0'}
                </div>
              </div>
              <h3 className='font-semibold text-foreground'>{barber.name}</h3>
              <p className='text-muted-foreground text-sm'>{barber.experience || 1} năm kinh nghiệm</p>
              <p className='text-primary/80 text-xs mt-1'>{barber.specialty || 'Tạo mẫu tóc'}</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-3 text-xs h-7 w-full text-muted-foreground hover:text-primary hover:bg-transparent'
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className='w-3 h-3 mr-1' />
                  Xem hồ sơ
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-112.5'>
                <DialogHeader>
                  <DialogTitle>Hồ sơ của {barber.name}</DialogTitle>
                  <DialogDescription>Thông tin chi tiết và bộ sưu tập mẫu tóc</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={barber.avatar || 'https://github.com/shadcn.png'}
                      alt={barber.name}
                      className='w-24 h-24 rounded-full border-2 border-primary object-cover'
                    />
                    <div>
                      <h3 className='text-lg font-bold'>{barber.name}</h3>
                      <div className='flex items-center gap-1 text-primary my-1'>
                        <Star className='w-4 h-4 fill-current' />
                        <span className='font-bold'>{barber.rating || '5.0'}</span>
                        <span className='text-muted-foreground text-sm ml-2'>
                          ({getPseudoRandomNumber(barber._id, 10, 59)} đánh giá)
                        </span>
                      </div>
                      <p className='text-sm font-medium text-foreground'>
                        {barber.specialty || 'Chuyên gia tạo mẫu tóc'}
                      </p>
                      <p className='text-sm text-muted-foreground'>{barber.experience || 1} năm kinh nghiệm</p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-sm'>Giới thiệu</h4>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      Tôi là {barber.name}, một thợ cắt tóc đam mê với {barber.experience || 1} năm kinh nghiệm. Tôi tin
                      rằng mỗi mái tóc là một tác phẩm nghệ thuật và luôn nỗ lực để mang lại sự tự tin cho khách hàng.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-sm'>Mẫu tóc ({getPseudoRandomNumber(barber._id, 3, 7)})</h4>
                    <div className='grid grid-cols-3 gap-2'>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className='aspect-square rounded-md bg-muted overflow-hidden relative group'>
                          <img
                            src={`https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&q=80&sep=${i}`}
                            className='w-full h-full object-cover transition-transform group-hover:scale-105'
                            alt='Hair sample'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className='w-full' onClick={() => onSelectBarber(barber._id)}>
                  Chọn thợ này
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingBarberStep
