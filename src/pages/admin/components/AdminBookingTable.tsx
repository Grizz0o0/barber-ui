import { Calendar, Clock, CheckCircle2, MoreHorizontal, Eye, Check, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BookingStatus, formatPrice } from '@/lib/constants'
import type { Booking } from '@/types'

interface AdminBookingTableProps {
  bookings: Booking[]
  loading: boolean
  handleStatusChange: (bookingId: string, newStatus: Booking['status']) => void
  handleViewBooking: (booking: Booking) => void
  handleRebook: (booking: Booking) => void
}

const statusConfig = {
  [BookingStatus.PENDING]: { label: 'Chờ xác nhận', color: 'text-yellow-500 bg-yellow-500/10' },
  [BookingStatus.CONFIRMED]: { label: 'Đã xác nhận', color: 'text-blue-500 bg-blue-500/10' },
  [BookingStatus.COMPLETED]: { label: 'Hoàn thành', color: 'text-green-500 bg-green-500/10' },
  [BookingStatus.CANCELLED]: { label: 'Đã hủy', color: 'text-red-500 bg-red-500/10' },
  [BookingStatus.NO_SHOW]: { label: 'Vắng mặt', color: 'text-zinc-500 bg-zinc-500/10' }
}

const AdminBookingTable = ({
  bookings,
  loading,
  handleStatusChange,
  handleViewBooking,
  handleRebook
}: AdminBookingTableProps) => {
  return (
    <Card className='bg-card/50 border-border/50'>
      <CardContent className='p-0'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Khách hàng</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Dịch vụ</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Thợ cắt</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Ngày giờ</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Giá</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Trạng thái</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const status = statusConfig[booking.status as keyof typeof statusConfig]
                    return (
                      <tr key={booking._id} className='border-b border-border/50 hover:bg-muted/50'>
                        <td className='py-4 px-4'>
                          <div>
                            <p className='font-medium'>
                              {(typeof booking.user === 'object' && booking.user?.name) || 'Vãng lai'}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {typeof booking.user === 'object' ? booking.user?.phone : ''}
                            </p>
                          </div>
                        </td>
                        <td className='py-4 px-4 text-muted-foreground'>{booking.service?.name}</td>
                        <td className='py-4 px-4 text-muted-foreground'>{booking.barber?.name}</td>
                        <td className='py-4 px-4'>
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Calendar className='w-4 h-4' />
                            {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                            <Clock className='w-4 h-4 ml-2' />
                            {new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className='py-4 px-4 font-medium text-primary'>{formatPrice(booking.totalPrice || 0)}</td>
                        <td className='py-4 px-4'>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${status?.color || ''}`}>
                            {status?.label || booking.status}
                          </span>
                        </td>
                        <td className='py-4 px-4'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                <Eye className='w-4 h-4 mr-2' />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {booking.status === BookingStatus.PENDING && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(booking._id, BookingStatus.CONFIRMED)}
                                >
                                  <Check className='w-4 h-4 mr-2' />
                                  Xác nhận
                                </DropdownMenuItem>
                              )}
                              {booking.status === BookingStatus.CONFIRMED && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(booking._id, BookingStatus.COMPLETED)}
                                >
                                  <CheckCircle2 className='w-4 h-4 mr-2' />
                                  Hoàn thành
                                </DropdownMenuItem>
                              )}
                              {(booking.status === BookingStatus.PENDING ||
                                booking.status === BookingStatus.CONFIRMED) && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(booking._id, BookingStatus.CANCELLED)}
                                >
                                  <X className='w-4 h-4 mr-2' />
                                  Hủy lịch
                                </DropdownMenuItem>
                              )}
                              {(booking.status === BookingStatus.CANCELLED ||
                                booking.status === BookingStatus.NO_SHOW) && (
                                <DropdownMenuItem onClick={() => handleRebook(booking)}>
                                  <Clock className='w-4 h-4 mr-2' />
                                  Đặt lại (Walk-in)
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {bookings.length === 0 && (
              <div className='py-12 text-center text-muted-foreground'>Không tìm thấy lịch đặt nào</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminBookingTable
