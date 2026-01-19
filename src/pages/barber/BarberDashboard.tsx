import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/constants'
import { Calendar, Clock, CheckCircle2, XCircle, User, Star, TrendingUp } from 'lucide-react'

// import { bookingsApi } from '@/lib/api' // Removed
import { useGetBookings, useUpdateBookingMutation } from '@/queries/useBooking'
import type { Booking } from '@/types'

const statusConfig = {
  pending: { label: 'Chờ', color: 'text-yellow-500 bg-yellow-500/10' },
  confirmed: { label: 'Xác nhận', color: 'text-blue-500 bg-blue-500/10' },
  completed: { label: 'Xong', color: 'text-green-500 bg-green-500/10' },
  cancelled: { label: 'Hủy', color: 'text-red-500 bg-red-500/10' }
}

const BarberDashboard = () => {
  const { user } = useAuth()
  // Fetch bookings for today
  // Calculate today range
  const today = new Date()
  const start = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const end = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const {
    data: bookingsData,
    isLoading: loadingBookings,
    refetch
  } = useGetBookings(
    {
      barber: user?._id || '',
      from: start,
      to: end,
      limit: 100
    },
    !!user?._id
  )

  const updateBookingMutation = useUpdateBookingMutation()

  const bookings = (bookingsData?.metadata?.bookings || []) as Booking[]
  const isLoading = loadingBookings

  // Derive stats
  const completed = bookings.filter((b: Booking) => b.status === 'completed').length
  const revenue = bookings
    .filter((b: Booking) => b.status === 'completed')
    .reduce((acc: number, curr: Booking) => acc + (curr.service?.price || 0), 0)

  // There's no separate 'stats' state now, we derive it for render?
  // Existing code uses specialized `stats` state array.
  // We can just construct the stats array on the fly.

  const statsDisplay = [
    { title: 'Lịch hẹn hôm nay', value: bookings.length.toString(), icon: Calendar },
    { title: 'Đã hoàn thành', value: completed.toString(), icon: CheckCircle2 },
    { title: 'Đánh giá TB', value: user?.rating?.toFixed(1) || '5.0', icon: Star },
    { title: 'Doanh thu', value: formatPrice(revenue), icon: TrendingUp }
  ]

  const updateStatus = (id: string, status: string) => {
    updateBookingMutation.mutate(
      { id, body: { status: status as any } },
      {
        onSuccess: () => {
          refetch()
        }
      }
    )
  }

  return (
    <div className='flex-1 p-4 space-y-1'>
      <div className='mb-8'>
        <h1 className='font-display text-2xl md:text-3xl font-bold'>Tổng quan</h1>
        <p className='text-muted-foreground'>Xin chào! Đây là tình hình hoạt động hôm nay.</p>
      </div>

      {/* Stats */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {statsDisplay.map((stat, index) => (
          <Card key={index} className='bg-card/50 border-border/50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                  <stat.icon className='w-5 h-5 text-primary' />
                </div>
              </div>
              <div>
                <p className='text-2xl font-bold'>{stat.value}</p>
                <p className='text-sm text-muted-foreground'>{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Bookings */}
      <Card className='bg-card/50 border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-primary' />
            Lịch hẹn hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='text-center py-8'>Đang tải...</div>
            ) : bookings.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>Hôm nay chưa có lịch hẹn nào</div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Khách hàng</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Dịch vụ</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Giờ</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Trạng thái</th>
                    <th className='text-right py-3 px-2 text-sm font-medium text-muted-foreground'>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: Booking) => {
                    const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
                    const time = new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    return (
                      <tr key={booking._id} className='border-b border-border/50 hover:bg-muted/50'>
                        <td className='py-3 px-2'>
                          <div className='font-medium'>
                            {(typeof booking.user === 'object' ? booking.user.name : null) || 'Khách vãng lai'}
                          </div>
                          {booking.notes && <div className='text-xs text-muted-foreground'>{booking.notes}</div>}
                        </td>
                        <td className='py-3 px-2 text-muted-foreground'>{booking.service?.name}</td>
                        <td className='py-3 px-2 text-muted-foreground flex items-center gap-1'>
                          <Clock className='w-3 h-3' />
                          {time}
                        </td>
                        <td className='py-3 px-2'>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className='py-3 px-2 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            {booking.status === 'confirmed' && (
                              <Button size='sm' variant='gold' onClick={() => updateStatus(booking._id, 'completed')}>
                                <CheckCircle2 className='w-4 h-4 mr-1' />
                                Hoàn thành
                              </Button>
                            )}
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => updateStatus(booking._id, 'confirmed')}
                                >
                                  Xác nhận
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='text-destructive'
                                  onClick={() => updateStatus(booking._id, 'cancelled')}
                                >
                                  <XCircle className='w-4 h-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BarberDashboard
