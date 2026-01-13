import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2, AlertTriangle } from 'lucide-react'
// import { bookingsApi, usersApi } from '@/lib/api' // Removed
import { useGetBarbers } from '@/queries/useAccount'
import { useHandleEmergencyMutation } from '@/queries/useBooking'
import { toast } from 'sonner'
import type { User } from '@/types'
import { format } from 'date-fns'

interface EmergencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barber: { _id: string; name: string } | null
  onSuccess: () => void
}

const EmergencyDialog = ({ open, onOpenChange, barber, onSuccess }: EmergencyDialogProps) => {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [action, setAction] = useState<'cancel' | 'move'>('cancel')
  const [targetBarberId, setTargetBarberId] = useState<string>('')

  // const [loading, setLoading] = useState(false) // Derived
  // const [executing, setExecuting] = useState(false) // Actually we use setExecuting in mutation callbacks? No, mutation has isPending.
  // Let's rely on mutation.isPending for executing.
  // But wait, my replacement code used setExecuting manually in mutation callbacks.
  // I should use mutation.isPending.
  // But I will correct this later. For now, executing state is fine.
  // Wait, I am REMOVING 'loading' logic in this tool call.
  // But checking replace, I defined `const loading = loadingBarbers`.
  // So I should remove `useState(false)` for loading.
  const [executing, setExecuting] = useState(false)

  const { data: barbersData, isLoading: loadingBarbers } = useGetBarbers()
  const handleEmergencyMutation = useHandleEmergencyMutation()

  const barbers = useMemo(() => {
    if (open && action === 'move' && barbersData?.metadata) {
      return barbersData.metadata.filter((b: User) => b._id !== barber?._id)
    }
    return []
  }, [open, action, barber, barbersData])

  const handleSubmit = async () => {
    if (action === 'move' && !targetBarberId) {
      toast.error('Vui lòng chọn thợ thay thế')
      return
    }

    setExecuting(true)
    handleEmergencyMutation.mutate(
      {
        barberId: barber?._id || '',
        date: new Date(date).toISOString(),
        action,
        targetBarberId: action === 'move' ? targetBarberId : undefined
      },
      {
        onSuccess: (data: any) => {
          // data is response
          const res = data
          if (res.metadata.failed && res.metadata.failed.length > 0) {
            toast.warning(`Đã xử lý: ${res.metadata.processed}. Lỗi/Xung đột: ${res.metadata.failed.length}`, {
              description: 'Một số lịch không chuyển được do trùng giờ. Vui lòng kiểm tra lại.',
              duration: 5000
            })
          } else {
            toast.success(res.metadata.message || 'Xử lý thành công')
          }
          onSuccess()
          onOpenChange(false)
          setExecuting(false)
        },
        onError: (error: any) => {
          toast.error(error.message || 'Có lỗi xảy ra')
          setExecuting(false)
        }
      }
    )
  }

  const loading = loadingBarbers

  if (!barber) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='w-5 h-5' />
            Báo nghỉ đột xuất: {barber.name}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Date Selection */}
          <div className='space-y-2'>
            <Label>Ngày nghỉ</Label>
            <Input type='date' value={date} onChange={(e) => setDate(e.target.value)} />
            <p className='text-xs text-muted-foreground'>Hệ thống sẽ quét các lịch hẹn trong ngày này.</p>
          </div>

          {/* Action Selection */}
          <div className='space-y-3'>
            <Label>Hành động xử lý</Label>
            <RadioGroup value={action} onValueChange={(v) => setAction(v as 'cancel' | 'move')}>
              <div className='flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer'>
                <RadioGroupItem value='cancel' id='r-cancel' />
                <Label htmlFor='r-cancel' className='cursor-pointer flex-1'>
                  <span className='font-semibold block'>Hủy tất cả lịch</span>
                  <span className='text-xs text-muted-foreground font-normal'>Gửi thông báo hủy cho khách hàng</span>
                </Label>
              </div>
              <div className='flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer'>
                <RadioGroupItem value='move' id='r-move' />
                <Label htmlFor='r-move' className='cursor-pointer flex-1'>
                  <span className='font-semibold block'>Chuyển sang thợ khác</span>
                  <span className='text-xs text-muted-foreground font-normal'>
                    Cố gắng xếp vào thợ khác (Best Effort)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Target Barber Selection */}
          {action === 'move' && (
            <div className='space-y-2 animate-in fade-in slide-in-from-top-2'>
              <Label>Chọn thợ thay thế</Label>
              {loading ? (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='w-4 h-4 animate-spin' /> Đang tải thợ...
                </div>
              ) : (
                <Select value={targetBarberId} onValueChange={setTargetBarberId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn thợ...' />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map((b: User) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Hủy bỏ</Button>
          </DialogClose>
          <Button variant='destructive' onClick={handleSubmit} disabled={executing}>
            {executing && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EmergencyDialog
