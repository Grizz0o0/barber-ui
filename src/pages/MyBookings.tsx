import { useState } from 'react'
import { Calendar, Clock, User, Star, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import type { Booking } from '@/types'
import { useGetBookings, useUpdateBookingMutation } from '@/queries/useBooking'

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const MyBookings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  // No need for bookings state, handled by query

  const {
    data: bookingsData,
    isLoading,
    refetch
  } = useGetBookings(
    {
      user: user?._id,
      limit: 100
    },
    !!user
  )

  const bookings = (bookingsData?.metadata?.bookings || []) as Booking[]
  const updateBookingMutation = useUpdateBookingMutation()

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return

    updateBookingMutation.mutate(
      { id, body: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast.success('Đã hủy lịch hẹn')
        },
        onError: () => {
          toast.error('Không thể hủy lịch hẹn')
        }
      }
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>Đã xác nhận</Badge>
      case 'pending':
        return <Badge className='bg-yellow-500/20 text-yellow-400 border-yellow-500/30'>Chờ xác nhận</Badge>
      case 'completed':
        return <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>Hoàn thành</Badge>
      case 'cancelled':
        return <Badge className='bg-red-500/20 text-red-400 border-red-500/30'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings
    return bookings.filter((b) => b.status === status)
  }

  const filteredBookings = filterBookings(activeTab)
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending')
  const completedBookings = bookings.filter((b) => b.status === 'completed')

  if (isLoading && bookings.length === 0) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            {/* Header */}
            <div className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div>
                <h1 className='font-display text-3xl font-bold mb-2'>
                  Lịch đặt <span className='text-gradient'>của tôi</span>
                </h1>
                <p className='text-muted-foreground'>Quản lý và theo dõi các lịch hẹn cắt tóc của bạn</p>
              </div>
              <Button variant='outline' onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-primary'>{bookings.length}</div>
                <div className='text-sm text-muted-foreground'>Tổng lịch hẹn</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-green-400'>{upcomingBookings.length}</div>
                <div className='text-sm text-muted-foreground'>Sắp tới</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-blue-400'>{completedBookings.length}</div>
                <div className='text-sm text-muted-foreground'>Hoàn thành</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-foreground'>--</div>
                <div className='text-sm text-muted-foreground flex items-center justify-center gap-1'>
                  <Star className='w-3 h-3 fill-primary text-primary' /> Đánh giá TB
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='w-full md:w-auto bg-secondary mb-6'>
                <TabsTrigger value='all' className='flex-1 md:flex-none'>
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value='confirmed' className='flex-1 md:flex-none'>
                  Đã xác nhận
                </TabsTrigger>
                <TabsTrigger value='pending' className='flex-1 md:flex-none'>
                  Chờ xác nhận
                </TabsTrigger>
                <TabsTrigger value='completed' className='flex-1 md:flex-none'>
                  Hoàn thành
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className='mt-0'>
                {filteredBookings.length > 0 ? (
                  <div className='space-y-4'>
                    {filteredBookings.map((booking) => {
                      const date = new Date(booking.startTime)
                      const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

                      // Handle populated fields safely
                      const serviceName = typeof booking.service === 'object' ? booking.service?.name : 'Dịch vụ'
                      const barberName = typeof booking.barber === 'object' ? booking.barber?.name : 'Barber'

                      return (
                        <div
                          key={booking._id}
                          className='bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group'
                        >
                          <div className='flex flex-col md:flex-row md:items-center gap-6'>
                            {/* Date Badge */}
                            <div className='shrink-0'>
                              <div className='bg-primary/10 border border-primary/20 rounded-xl p-4 text-center w-20'>
                                <div className='text-xs text-primary font-medium uppercase'>
                                  {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                </div>
                                <div className='text-2xl font-bold text-foreground'>{date.getDate()}</div>
                                <div className='text-xs text-muted-foreground'>Th{date.getMonth() + 1}</div>
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between gap-4 mb-3'>
                                <div>
                                  <h3 className='font-semibold text-foreground text-lg'>
                                    {serviceName || 'Dịch vụ đã xóa'}
                                  </h3>
                                  <div className='flex items-center gap-4 mt-2 flex-wrap'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                      <Clock className='w-4 h-4 text-primary' />
                                      {timeStr}
                                    </div>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                      <User className='w-4 h-4 text-primary' />
                                      {barberName || 'Barber đã xóa'}
                                    </div>
                                  </div>
                                </div>
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className='flex items-center justify-between pt-3 border-t border-border/50'>
                                <div className='text-lg font-bold text-primary'>
                                  {formatPrice(booking.totalPrice || 0)}
                                </div>
                                <div className='flex gap-2'>
                                  {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleCancelBooking(booking._id)}
                                    >
                                      Hủy lịch
                                    </Button>
                                  )}
                                  {booking.status === 'completed' && !booking.hasReview && (
                                    <Button variant='gold' size='sm'>
                                      <Star className='w-4 h-4 mr-1' />
                                      Đánh giá
                                    </Button>
                                  )}
                                  {/* <Button variant='ghost' size='sm' className='group-hover:text-primary'>
                                    Chi tiết
                                    <ChevronRight className='w-4 h-4 ml-1' />
                                  </Button> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title='Không có lịch hẹn'
                    description='Bạn chưa có lịch hẹn nào trong danh sách này.'
                    action={
                      <Link to='/booking'>
                        <Button variant='gold'>Đặt lịch ngay</Button>
                      </Link>
                    }
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default MyBookings
