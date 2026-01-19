import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Calendar, ShoppingBag } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { useGetBooking } from '@/queries/useBooking'
import { useGetOrder } from '@/queries/useOrder'
import { useGetPaymentByTransactionId } from '@/queries/usePayment'

const PaymentResult = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // MoMo returns these params
  const resultCode = searchParams.get('resultCode')
  const message = searchParams.get('message')
  const transactionId = searchParams.get('orderId') // orderId from MoMo IS our transactionId

  // 1. Fetch Payment by Transaction ID first
  const { data: paymentData, isLoading: loadingPayment } = useGetPaymentByTransactionId(
    transactionId || '',
    !!transactionId && resultCode === '0'
  )

  const payment = paymentData?.metadata

  // 2. Fetch Booking OR Order based on what we found in Payment
  const shouldFetchBooking = !!payment?.booking
  const shouldFetchOrder = !!payment?.order

  const { data: bookingData, isLoading: loadingBooking } = useGetBooking(payment?.booking || '', shouldFetchBooking)
  const { data: orderData, isLoading: loadingOrder } = useGetOrder(payment?.order || '', shouldFetchOrder)

  // Derived state calculations
  let verificationStatus: 'loading' | 'success' | 'failed' = 'loading'
  let errorMessage: string | null = null
  let verifiedType: 'booking' | 'order' | null = null

  if (!transactionId) {
    verificationStatus = 'failed'
    errorMessage = 'Không tìm thấy mã giao dịch'
  } else if (resultCode !== '0') {
    verificationStatus = 'failed'
    errorMessage = message || 'Giao dịch thất bại từ phía MoMo'
  } else if (loadingPayment || loadingBooking || loadingOrder) {
    verificationStatus = 'loading'
  } else if (payment && bookingData?.metadata) {
    verificationStatus = 'success'
    verifiedType = 'booking'
  } else if (payment && orderData?.metadata) {
    verificationStatus = 'success'
    verifiedType = 'order'
  } else {
    // Loaded everything, result code 0, but no matching local data found
    verificationStatus = 'failed'
    errorMessage = 'Không tìm thấy thông tin đơn hàng trong hệ thống'
  }

  const renderContent = () => {
    if (verificationStatus === 'loading') {
      return (
        <div className='py-20'>
          <Loader2 className='w-12 h-12 animate-spin text-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Đang xác thực kết quả thanh toán...</p>
        </div>
      )
    }

    if (verificationStatus === 'success') {
      return (
        <div className='animate-in fade-in zoom-in duration-500'>
          <div className='w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6'>
            <CheckCircle className='w-10 h-10 text-green-500' />
          </div>
          <h1 className='text-3xl font-bold mb-2 text-foreground'>Thanh toán thành công!</h1>
          <p className='text-muted-foreground mb-8'>
            Giao dịch của bạn đã được ghi nhận. Cảm ơn bạn đã sử dụng dịch vụ.
          </p>

          <div className='bg-secondary/50 rounded-xl p-4 mb-8 text-sm'>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Kết quả</span>
              <span className='font-medium text-green-500'>Thành công</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Loại giao dịch</span>
              <span className='font-medium flex items-center gap-1'>
                {verifiedType === 'booking' ? (
                  <>
                    <Calendar className='w-4 h-4' /> Đặt lịch
                  </>
                ) : (
                  <>
                    <ShoppingBag className='w-4 h-4' /> Mua hàng
                  </>
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Mã giao dịch</span>
              <span className='font-mono font-medium'>{transactionId}</span>
            </div>
          </div>

          <div className='space-y-3'>
            {verifiedType === 'booking' ? (
              <Button className='w-full' size='lg' variant='gold' asChild>
                <Link to='/bookings'>Xem lịch hẹn của tôi</Link>
              </Button>
            ) : (
              <Button className='w-full' size='lg' variant='gold' asChild>
                <Link to='/orders'>Xem đơn hàng của tôi</Link>
              </Button>
            )}
            <Button variant='ghost' className='w-full' asChild>
              <Link to='/'>Về trang chủ</Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className='animate-in fade-in zoom-in duration-500'>
        <div className='w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6'>
          <XCircle className='w-10 h-10 text-red-500' />
        </div>
        <h1 className='text-2xl font-bold mb-2 text-foreground'>Thanh toán thất bại</h1>
        <p className='text-muted-foreground mb-8'>
          {errorMessage || message || 'Giao dịch bị hủy hoặc xảy ra lỗi. Vui lòng thử lại.'}
        </p>

        <div className='space-y-3'>
          <Button className='w-full' size='lg' variant='outline' onClick={() => navigate(-1)}>
            Thử lại
          </Button>
          <Button variant='ghost' className='w-full' asChild>
            <Link to='/'>Về trang chủ</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className='min-h-[80vh] flex items-center justify-center bg-secondary/20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-md mx-auto bg-card border border-border rounded-3xl p-8 text-center shadow-xl'>
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PaymentResult
