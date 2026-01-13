import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Booking } from '@/types'
import type { GetBookingQuery } from '@/lib/schemas/booking.schema'
import { BookingStatus } from '@/lib/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetBarbers } from '@/queries/useAccount'
import { useGetBookings, useUpdateBookingMutation } from '@/queries/useBooking'

import CreateBookingDialog from './components/CreateBookingDialog'
import ViewBookingDialog from './components/ViewBookingDialog'
import AdminBookingTable from './components/AdminBookingTable'
import AdminBookingFilters from './components/AdminBookingFilters'

const AdminBookings = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterBarber, setFilterBarber] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [rebookData, setRebookData] = useState<any>(null)
  const [page, setPage] = useState(1)

  // Fetch Barbers
  const { data: barbersData } = useGetBarbers()
  const barbers = barbersData?.metadata || []

  // Fetch Bookings with Query Hook
  const queryParams: GetBookingQuery = {
    page,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc'
  }
  if (filterStatus !== 'all') queryParams.status = filterStatus as Booking['status']
  if (filterBarber !== 'all') queryParams.barber = filterBarber

  const { data: bookingsData, isLoading: loading, refetch } = useGetBookings(queryParams)
  const updateBookingMutation = useUpdateBookingMutation()

  const bookings = bookingsData?.metadata?.bookings || []
  const totalPages = bookingsData?.metadata?.pagination?.total_pages || 1
  const totalBookings = bookingsData?.metadata?.pagination?.total_items || 0

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    updateBookingMutation.mutate(
      { id: bookingId, body: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success('Cập nhật thành công', {
            description: `Lịch đặt đã được ${
              newStatus === BookingStatus.CONFIRMED
                ? 'xác nhận'
                : newStatus === BookingStatus.COMPLETED
                  ? 'hoàn thành'
                  : 'hủy'
            }.`
          })
        },
        onError: () => {
          toast.error('Cập nhật trạng thái thất bại')
        }
      }
    )
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setViewDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleRebook = (booking: Booking) => {
    setRebookData({
      userId: typeof booking.user === 'object' ? booking.user._id : booking.user,
      serviceId: typeof booking.service === 'object' ? booking.service._id : booking.service,
      notes: booking.notes
    })
    setCreateDialogOpen(true)
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterBarber('all')
    setPage(1)
  }

  return (
    <div className='p-6 lg:p-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý lịch đặt</h1>
          <p className='text-muted-foreground'>
            Xem và quản lý tất cả lịch hẹn của khách hàng.{' '}
            <span className='font-medium text-foreground'>({totalBookings} lịch)</span>
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>+ Tạo lịch (Walk-in)</Button>
      </div>

      {/* Filters */}
      <AdminBookingFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterBarber={filterBarber}
        setFilterBarber={setFilterBarber}
        barbers={barbers}
        resetFilters={resetFilters}
      />

      {/* Bookings Table */}
      <AdminBookingTable
        bookings={bookings}
        loading={loading}
        handleStatusChange={handleStatusChange}
        handleViewBooking={handleViewBooking}
        handleRebook={handleRebook}
      />

      {/* Pagination */}
      {!loading && bookings.length > 0 && totalPages > 1 && (
        <div className='flex items-center justify-end p-4 border-t border-border gap-2 bg-card/50 border border-t-0 rounded-b-xl -mt-px'>
          <Button variant='outline' size='sm' onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <span className='text-sm text-muted-foreground'>
            Trang {page} / {totalPages}
          </span>
          <Button variant='outline' size='sm' onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      )}

      <ViewBookingDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        booking={selectedBooking}
        onSuccess={() => refetch()} // Or just rely on auto invalidation from mutation if mutations happen elsewhere
      />

      <CreateBookingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
        barbers={barbers}
        initialValues={rebookData}
      />
    </div>
  )
}

export default AdminBookings
