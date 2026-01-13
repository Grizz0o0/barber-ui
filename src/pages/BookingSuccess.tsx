import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, User, Scissors, MapPin, Phone, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import { formatPrice, SHOP_INFO } from '@/lib/constants'
import { useGetBooking } from '@/queries/useBooking'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const BookingSuccess = () => {
  const { id } = useParams<{ id: string }>()
  const { data: bookingData, isLoading: isLoadingBooking, isError } = useGetBooking(id || '')

  const booking = bookingData?.metadata || null
  const isLoading = isLoadingBooking
  const error = isError ? 'Không tìm thấy thông tin đặt lịch' : null // Simplified error handling

  if (isLoading) {
    return (
      <Layout>
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4'>
          <AlertCircle className='w-12 h-12 text-destructive mb-4' />
          <h1 className='text-2xl font-bold mb-2'>Lỗi</h1>
          <p className='text-muted-foreground mb-6'>{error || 'Không tìm thấy thông tin'}</p>
          <Button variant='gold' asChild>
            <Link to='/'>Về trang chủ</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  const { service, barber, startTime, totalPrice } = booking
  const dateStr = format(new Date(startTime), 'EEEE, dd/MM/yyyy', { locale: vi })
  const timeStr = format(new Date(startTime), 'HH:mm')

  return (
    <Layout>
      <div className='min-h-[80vh] flex items-center justify-center py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-lg mx-auto text-center'>
            {/* Success Icon */}
            <div className='mb-8 animate-fade-in'>
              <div className='w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto'>
                <CheckCircle className='w-14 h-14 text-green-500' />
              </div>
            </div>

            {/* Title */}
            <h1 className='text-3xl md:text-4xl font-bold mb-4 animate-fade-in' style={{ animationDelay: '0.1s' }}>
              Đặt lịch thành công!
            </h1>
            <p className='text-muted-foreground text-lg mb-8 animate-fade-in' style={{ animationDelay: '0.2s' }}>
              Cảm ơn bạn đã tin tưởng {SHOP_INFO.name}. Chúng tôi đã nhận được yêu cầu đặt lịch của bạn.
            </p>

            {/* Booking Details Card */}
            <div
              className='bg-card border border-border rounded-2xl p-6 mb-8 text-left animate-fade-in'
              style={{ animationDelay: '0.3s' }}
            >
              <h2 className='font-semibold text-lg mb-4 text-center'>Chi tiết lịch hẹn</h2>

              <div className='space-y-4'>
                <div className='flex items-center gap-3 p-3 bg-secondary/50 rounded-lg'>
                  <Scissors className='w-5 h-5 text-primary' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Dịch vụ</p>
                    <p className='font-medium'>{service?.name || 'Dịch vụ đã bị xóa'}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-secondary/50 rounded-lg'>
                  <User className='w-5 h-5 text-primary' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Thợ cắt</p>
                    <p className='font-medium'>{barber?.name || 'Thợ cắt đã bị xóa'}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='flex items-center gap-3 p-3 bg-secondary/50 rounded-lg'>
                    <Calendar className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-sm text-muted-foreground'>Ngày</p>
                      <p className='font-medium capitalize'>{dateStr}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-secondary/50 rounded-lg'>
                    <Clock className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-sm text-muted-foreground'>Giờ</p>
                      <p className='font-medium'>{timeStr}</p>
                    </div>
                  </div>
                </div>

                <div className='border-t border-border pt-4 mt-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Tổng tiền</span>
                    <span className='text-2xl font-bold text-primary'>
                      {totalPrice ? formatPrice(totalPrice) : formatPrice(service?.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div
              className='bg-card/50 border border-border rounded-xl p-4 mb-8 text-left animate-fade-in'
              style={{ animationDelay: '0.4s' }}
            >
              <div className='flex items-start gap-3 mb-3'>
                <MapPin className='w-5 h-5 text-primary mt-0.5' />
                <div>
                  <p className='font-medium'>Địa chỉ</p>
                  <p className='text-sm text-muted-foreground'>{SHOP_INFO.address}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Phone className='w-5 h-5 text-primary mt-0.5' />
                <div>
                  <p className='font-medium'>Hotline</p>
                  <p className='text-sm text-muted-foreground'>{SHOP_INFO.phone}</p>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className='text-sm text-muted-foreground mb-8 animate-fade-in' style={{ animationDelay: '0.5s' }}>
              Vui lòng đến đúng giờ. Nếu cần thay đổi lịch hẹn, hãy liên hệ trước ít nhất 2 giờ.
            </p>

            {/* Actions */}
            <div
              className='flex flex-col sm:flex-row gap-4 justify-center animate-fade-in'
              style={{ animationDelay: '0.6s' }}
            >
              <Button variant='gold' size='lg' asChild>
                <Link to='/bookings'>Xem lịch hẹn của tôi</Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link to='/'>Về trang chủ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BookingSuccess
