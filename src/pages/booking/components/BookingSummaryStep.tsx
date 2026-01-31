import { useState } from 'react'
import { format } from 'date-fns'
import { formatPrice, formatDuration } from '@/lib/constants'
import type { Service, User } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Ticket, CheckCircle2, XCircle } from 'lucide-react'
import { promotionApiRequest } from '@/apiRequests/promotion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BookingSummaryStepProps {
  selectedServiceData: Service | undefined
  selectedBarberData: User | undefined
  selectedDate: Date | undefined
  selectedTime: string | null
  notes: string
  onApplyPromotion: (promotion: any | null) => void
  promotion: any | null
}

const BookingSummaryStep = ({
  selectedServiceData,
  selectedBarberData,
  selectedDate,
  selectedTime,
  notes,
  onApplyPromotion,
  promotion
}: BookingSummaryStepProps) => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApplyPromotion = async () => {
    if (!code.trim()) return
    if (!selectedServiceData) {
      toast.error('Vui lòng chọn dịch vụ trước')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await promotionApiRequest.verifyPromotion({
        code: code.trim(),
        amount: selectedServiceData.price,
        context: 'service'
      })

      if (res.metadata.isValid) {
        onApplyPromotion({
          ...res.metadata,
          code: code.trim() // Ensure code is passed back
        })
        toast.success('Áp dụng mã giảm giá thành công!')
      } else {
        setError(res.metadata.message || 'Mã khuyến mãi không hợp lệ')
        onApplyPromotion(null)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Lỗi khi kiểm tra mã khuyến mãi')
      onApplyPromotion(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePromotion = () => {
    setCode('')
    setError('')
    onApplyPromotion(null)
  }

  const finalPrice = selectedServiceData ? selectedServiceData.price - (promotion?.discountAmount || 0) : 0

  return (
    <div className='animate-fade-in'>
      <h2 className='text-center mb-8'>
        Xác nhận <span className='text-gradient'>đặt lịch</span>
      </h2>
      <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Dịch vụ</span>
          <span className='font-semibold text-foreground'>{selectedServiceData?.name}</span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Thợ cắt</span>
          <span className='font-semibold text-foreground'>{selectedBarberData?.name}</span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Ngày giờ</span>
          <span className='font-semibold text-foreground'>
            {selectedDate && format(selectedDate, 'dd/MM/yyyy')} - {selectedTime}
          </span>
        </div>
        <div className='flex items-center justify-between py-3 border-b border-border'>
          <span className='text-muted-foreground'>Thời lượng</span>
          <span className='font-semibold text-foreground'>
            {selectedServiceData && formatDuration(selectedServiceData.duration)}
          </span>
        </div>
        {notes && (
          <div className='flex items-center justify-between py-3 border-b border-border'>
            <span className='text-muted-foreground'>Ghi chú</span>
            <span className='font-semibold text-foreground'>{notes}</span>
          </div>
        )}

        {/* Promotion Input */}
        <div className='py-3 border-b border-border'>
          <div className='flex items-center gap-2 mb-2'>
            <Ticket className='w-4 h-4 text-primary' />
            <span className='font-medium'>Mã khuyến mãi</span>
          </div>

          {!promotion ? (
            <div className='flex gap-2'>
              <Input
                placeholder='Nhập mã giảm giá'
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                disabled={isLoading}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
              <Button variant='outline' onClick={handleApplyPromotion} disabled={!code || isLoading}>
                {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Áp dụng'}
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between bg-primary/10 p-3 rounded-md border border-primary/20'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-primary' />
                <div>
                  <p className='font-medium text-primary'>{promotion.code}</p>
                  <p className='text-xs text-muted-foreground'>Đã giảm {formatPrice(promotion.discountAmount)}</p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleRemovePromotion}
                className='h-8 w-8 text-muted-foreground hover:text-destructive'
              >
                <XCircle className='w-5 h-5' />
              </Button>
            </div>
          )}
          {error && <p className='text-destructive text-sm mt-1'>{error}</p>}
        </div>

        <div className='space-y-2 pt-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Tạm tính</span>
            <span>{selectedServiceData && formatPrice(selectedServiceData.price)}</span>
          </div>
          {promotion && (
            <div className='flex items-center justify-between text-sm text-green-500'>
              <span>Giảm giá</span>
              <span>-{formatPrice(promotion.discountAmount)}</span>
            </div>
          )}
          <div className='flex items-center justify-between pt-2 border-t border-border'>
            <span className='text-muted-foreground font-medium'>Tổng tiền</span>
            <span className='text-primary font-bold text-xl'>{formatPrice(finalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingSummaryStep
