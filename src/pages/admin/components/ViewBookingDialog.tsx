import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pen, Save, X, Loader2 } from 'lucide-react'
// import { bookingsApi, servicesApi } from '@/lib/api' // Removed
import { useGetServices } from '@/queries/useService'
import { useUpdateBookingMutation } from '@/queries/useBooking'
import { toast } from 'sonner'
import type { Service } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookingStatus, formatPrice } from '@/lib/constants'
import type { Booking } from '@/types'

const statusConfig = {
  [BookingStatus.PENDING]: { label: 'Chờ xác nhận', color: 'text-yellow-500 bg-yellow-500/10' },
  [BookingStatus.CONFIRMED]: { label: 'Đã xác nhận', color: 'text-blue-500 bg-blue-500/10' },
  [BookingStatus.COMPLETED]: { label: 'Hoàn thành', color: 'text-green-500 bg-green-500/10' },
  [BookingStatus.CANCELLED]: { label: 'Đã hủy', color: 'text-red-500 bg-red-500/10' }
}

interface ViewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  booking: Booking | null
}

const ViewBookingDialog = ({ open, onOpenChange, booking, onSuccess }: ViewBookingDialogProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const [selectedServiceId, setSelectedServiceId] = useState<string>('')

  // Reset state on open/close
  // Derived state to reset form when dialog opens or booking changes
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevBooking, setPrevBooking] = useState(booking)

  if (open !== prevOpen || booking !== prevBooking) {
    setPrevOpen(open)
    setPrevBooking(booking)
    if (open && booking) {
      setIsEditing(false)
      setSelectedServiceId(typeof booking.service === 'object' ? booking.service._id : booking.service || '')
    }
  }

  const { data: servicesData, isLoading: loadingServices } = useGetServices()
  const updateBookingMutation = useUpdateBookingMutation()

  const services = (servicesData?.metadata?.services || []) as Service[]

  // Note: previously services were fetched only on edit mode.
  // With hooks, we can fetch always or conditionally.
  // Ideally, useGetServices is cheap (cached).
  // We can leave it active or use `enabled: isEditing` if `useGetServices` supported it.
  // But `useGetServices` currently doesn't support enabled param.
  // So it fetches on mount if used.
  // This is fine for admin panel.

  // Removed manual fetchServices useEffect

  const handleSave = async () => {
    if (!booking) return
    if (selectedServiceId === (typeof booking.service === 'object' ? booking.service._id : booking.service)) {
      setIsEditing(false)
      return
    }

    // setLoading(true) handled by mutation
    updateBookingMutation.mutate(
      { id: booking._id, body: { service: selectedServiceId } },
      {
        onSuccess: () => {
          toast.success('Cập nhật dịch vụ thành công')
          setIsEditing(false)
          if (onSuccess) onSuccess()
          onOpenChange(false)
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message || 'Cập nhật thất bại'
          toast.error(msg, { duration: 5000 })
        }
      }
    )
  }

  const loading = updateBookingMutation.isPending || loadingServices

  if (!booking) return null

  const status = statusConfig[booking.status as keyof typeof statusConfig]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex justify-between items-center pr-8'>
            Chi tiết lịch đặt
            {!isEditing ? (
              <Button variant='ghost' size='sm' onClick={() => setIsEditing(true)}>
                <Pen className='w-4 h-4 mr-2' /> Sửa
              </Button>
            ) : (
              <div className='flex gap-2'>
                <Button variant='ghost' size='sm' onClick={() => setIsEditing(false)} disabled={loading}>
                  <X className='w-4 h-4 mr-2' /> Hủy
                </Button>
                <Button size='sm' onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4 mr-2' />}
                  Lưu
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Khách hàng</p>
              <p className='font-medium'>{(typeof booking.user === 'object' && booking.user?.name) || 'Vãng lai'}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Số điện thoại</p>
              <p className='font-medium'>{typeof booking.user === 'object' ? booking.user?.phone : 'N/A'}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Email</p>
              <p className='font-medium'>{typeof booking.user === 'object' ? booking.user?.email : 'N/A'}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Dịch vụ</p>
              {isEditing ? (
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={loading}>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Chọn dịch vụ' />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} ({s.duration}p)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className='font-medium'>{typeof booking.service === 'object' ? booking.service?.name : 'N/A'}</p>
              )}
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Thợ cắt</p>
              <p className='font-medium'>{typeof booking.barber === 'object' ? booking.barber?.name : 'N/A'}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Ngày giờ</p>
              <p className='font-medium'>
                {new Date(booking.startTime).toLocaleDateString('vi-VN')} -{' '}
                {new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Tổng tiền</p>
              <p className='font-medium text-primary'>{formatPrice(booking.totalPrice || 0)}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Trạng thái</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs ${status?.color || ''}`}>
                {status?.label || booking.status}
              </span>
            </div>
            {booking.notes && (
              <div className='col-span-2'>
                <p className='text-sm text-muted-foreground'>Ghi chú</p>
                <p className='font-medium text-sm'>{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ViewBookingDialog
