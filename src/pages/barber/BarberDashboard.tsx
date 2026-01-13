import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/constants'
import { Scissors, Calendar, Clock, CheckCircle2, XCircle, LogOut, User, Star, TrendingUp } from 'lucide-react'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  // Removed handleLogout, updateStatus manual implementation
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const updateStatus = (id: string, status: string) => {
    updateBookingMutation.mutate(
      { id, body: { status: status as any } },
      {
        onSuccess: () => {
          // Refetch or invalidate
          refetch() // or queryClient INVALIDATE is automatic if useUpdateBookingMutation handles it.
          // useUpdateBookingMutation invalidates 'bookings'.
        }
      }
    )
  }

  // NOTE: I need to replace references to `stats` state in JSX with `statsDisplay`.
  // And remove `useEffect` for fetching.

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center'>
                <Scissors className='w-5 h-5 text-primary-foreground' />
              </div>
              <div>
                <h1 className='font-display font-bold'>Barber Panel</h1>
                <p className='text-sm text-muted-foreground'>{user?.name || 'Thợ cắt'}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Link to='/'>
                <Button variant='outline' size='sm'>
                  Về trang chủ
                </Button>
              </Link>
              <Button variant='ghost' size='sm' onClick={handleLogout}>
                <LogOut className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        {/* Stats */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          {statsDisplay.map((stat, index) => (
            <Card key={index} className='bg-card/50 border-border/50'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center'>
                    <stat.icon className='w-6 h-6 text-primary' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold'>{stat.value}</p>
                    <p className='text-sm text-muted-foreground'>{stat.title}</p>
                  </div>
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
            {isLoading ? (
              <div className='text-center py-8'>Đang tải...</div>
            ) : bookings.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>Hôm nay chưa có lịch hẹn nào</div>
            ) : (
              <div className='space-y-4'>
                {bookings.map((booking: Booking) => {
                  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
                  const time = new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  return (
                    <div
                      key={booking._id}
                      className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/50'
                    >
                      <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
                        <User className='w-6 h-6 text-primary' />
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium'>
                          {(typeof booking.user === 'object' ? booking.user.name : null) || 'Khách vãng lai'}
                        </p>
                        <p className='text-sm text-muted-foreground'>{booking.service?.name}</p>
                        {booking.notes && (
                          <p className='text-xs text-muted-foreground mt-1'>Ghi chú: {booking.notes}</p>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Clock className='w-4 h-4' />
                        {time}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${status.color}`}>
                        {status.label}
                      </span>
                      <div className='flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end'>
                        {booking.status === 'confirmed' && (
                          <Button size='sm' variant='gold' onClick={() => updateStatus(booking._id, 'completed')}>
                            <CheckCircle2 className='w-4 h-4 mr-1' />
                            Hoàn thành
                          </Button>
                        )}
                        {booking.status === 'pending' && (
                          <div className='flex gap-2'>
                            <Button size='sm' variant='outline' onClick={() => updateStatus(booking._id, 'confirmed')}>
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
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default BarberDashboard
