import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Check, ArrowRight, ArrowLeft, Loader2, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Layout from '@/components/layout/Layout'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookingStatus, PaymentMethod } from '@/lib/constants'
import type { Booking as BookingType, Service, User } from '@/types'
import { useGetBarbers } from '@/queries/useAccount'
import { useGetServices } from '@/queries/useService'
import { useGetBookings, useCreateBookingMutation } from '@/queries/useBooking'
import { useCreateMomoPaymentMutation } from '@/queries/usePayment'

import BookingServiceStep from './booking/components/BookingServiceStep'
import BookingBarberStep from './booking/components/BookingBarberStep'
import BookingTimeStep from './booking/components/BookingTimeStep'
import BookingSummaryStep from './booking/components/BookingSummaryStep'

const Booking = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [searchParams] = useSearchParams()
  const serviceIdFromUrl = searchParams.get('serviceId')
  const [selectedService, setSelectedService] = useState<string | null>(serviceIdFromUrl)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.CASH)
  const [notes, setNotes] = useState('')

  // Mutations
  const createBookingMutation = useCreateBookingMutation()
  const createMomoPaymentMutation = useCreateMomoPaymentMutation()

  // Queries
  const { data: servicesData, isLoading: isServicesLoading } = useGetServices()
  const services = (servicesData?.metadata?.services || []) as Service[]

  const { data: barbersData } = useGetBarbers()
  const barbers = (barbersData?.metadata || []) as User[]

  const isLoading = isServicesLoading

  // Calculate start and end time for availability check
  const checkDateStart = selectedDate ? new Date(selectedDate) : undefined
  if (checkDateStart) checkDateStart.setHours(0, 0, 0, 0)
  const checkDateEnd = selectedDate ? new Date(selectedDate) : undefined
  if (checkDateEnd) checkDateEnd.setHours(23, 59, 59, 999)

  // Availability Query
  const { data: bookingsData, isLoading: isCheckingAvailability } = useGetBookings(
    {
      barber: selectedBarber || undefined,
      from: checkDateStart?.toISOString(),
      to: checkDateEnd?.toISOString()
    },
    !!selectedBarber && !!selectedDate
  )

  // Calculate disabled slots from bookingsData
  const disabledTimeSlots = useMemo(() => {
    if (!bookingsData?.metadata?.bookings) return []

    const bookings = bookingsData.metadata.bookings
    // Only consider active bookings
    const activeBookings = bookings.filter((b: BookingType) =>
      ([BookingStatus.CONFIRMED, BookingStatus.PENDING] as string[]).includes(b.status)
    )

    return activeBookings.map((booking: BookingType) => {
      const d = new Date(booking.startTime)
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    })
  }, [bookingsData])

  const selectedServiceData = services.find((s) => s._id === selectedService)
  const selectedBarberData = barbers.find((b) => b._id === selectedBarber)

  const handleNext = () => {
    if (step === 1 && !selectedService) {
      toast.error('Vui lòng chọn dịch vụ')
      return
    }
    if (step === 2 && !selectedBarber) {
      toast.error('Vui lòng chọn thợ cắt')
      return
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      toast.error('Vui lòng chọn ngày và giờ')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !isAuthenticated) return

    // Create startTime date object
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dateTimeStr = `${dateStr}T${selectedTime}:00`
    const startTime = new Date(dateTimeStr)

    createBookingMutation.mutate(
      {
        barber: selectedBarber,
        service: selectedService,
        startTime: startTime.toISOString(),
        notes: notes
      },
      {
        onSuccess: (res: any) => {
          // Payment Handling
          if (paymentMethod === PaymentMethod.MOMO && res.metadata?._id) {
            const bookingId = res.metadata._id
            const amount = selectedServiceData?.price || 0

            toast.loading('Đang chuyển hướng đến MoMo...')
            createMomoPaymentMutation.mutate(
              {
                amount,
                bookingId: bookingId,
                orderInfo: `Thanh toan dat lich hen Cat toc tu ${selectedBarberData?.name}`
              },
              {
                onSuccess: (paymentRes: any) => {
                  if (paymentRes.metadata?.payUrl) {
                    window.location.href = paymentRes.metadata.payUrl
                  } else {
                    toast.error('Không lấy được link thanh toán. Vui lòng thanh toán tại quầy.')
                    navigate(`/booking-success/${bookingId}`)
                  }
                },
                onError: () => {
                  toast.error('Lỗi khởi tạo thanh toán. Vui lòng thanh toán tại quầy.')
                  navigate(`/booking-success/${res.metadata._id}`)
                }
              }
            )
          } else {
            toast.success('Đặt lịch thành công!', {
              description: 'Chúng tôi sẽ liên hệ xác nhận với bạn'
            })

            if (res.metadata && res.metadata._id) {
              navigate(`/booking-success/${res.metadata._id}`)
            } else {
              navigate('/bookings')
            }
          }
        },
        onError: (error: any) => {
          toast.error(error.message || 'Đặt lịch thất bại. Vui lòng thử lại.')
        }
      }
    )
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <section className='py-20'>
          <div className='container mx-auto px-4 text-center'>
            <div className='max-w-md mx-auto bg-card border border-border rounded-2xl p-8'>
              <Scissors className='w-12 h-12 text-primary mx-auto mb-4' />
              <h1 className='font-display text-2xl font-bold mb-4'>Đăng nhập để đặt lịch</h1>
              <p className='text-muted-foreground mb-6'>Bạn cần đăng nhập để sử dụng tính năng đặt lịch</p>
              <div className='flex flex-col gap-3'>
                <Link to='/login'>
                  <Button variant='gold' className='w-full'>
                    Đăng nhập
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button variant='outline' className='w-full'>
                    Đăng ký tài khoản
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  const isSubmitting = createBookingMutation.isPending || createMomoPaymentMutation.isPending

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          {/* Progress */}
          <div className='flex items-center justify-center gap-2 mb-12'>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className='flex items-center'>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {step > s ? <Check className='w-5 h-5' /> : s}
                </div>
                {s < 4 && <div className={cn('w-16 h-1 mx-2 rounded', step > s ? 'bg-primary' : 'bg-secondary')} />}
              </div>
            ))}
          </div>

          <div className='max-w-3xl mx-auto'>
            {/* Step 1: Service */}
            {step === 1 && (
              <BookingServiceStep
                services={services}
                selectedService={selectedService}
                onSelectService={setSelectedService}
              />
            )}

            {/* Step 2: Barber */}
            {step === 2 && (
              <BookingBarberStep barbers={barbers} selectedBarber={selectedBarber} onSelectBarber={setSelectedBarber} />
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <BookingTimeStep
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                notes={notes}
                onNotesChange={setNotes}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                disabledTimeSlots={disabledTimeSlots}
                isCheckingAvailability={isCheckingAvailability}
              />
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <BookingSummaryStep
                selectedServiceData={selectedServiceData}
                selectedBarberData={selectedBarberData}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                notes={notes}
              />
            )}

            {/* Navigation */}
            <div className='flex justify-between mt-8'>
              <Button variant='outline' onClick={handleBack} disabled={step === 1 || isSubmitting}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Quay lại
              </Button>
              {step < 4 ? (
                <Button variant='gold' onClick={handleNext} disabled={isSubmitting}>
                  Tiếp tục
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button variant='gold' onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Xác nhận đặt lịch
                      <Check className='w-4 h-4 ml-2' />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Booking
