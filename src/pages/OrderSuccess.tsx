import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Package, Truck, CreditCard, Phone, Copy, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import { formatPrice } from '@/lib/constants'
import { toast } from 'sonner'
import { useGetOrder } from '@/queries/useOrder'

interface OrderItem {
  product: {
    name: string
    price: number
    images?: string[]
  }
  quantity: number
  price?: number
}

interface OrderResponse {
  _id: string
  items: OrderItem[]
  totalPrice: number
  paymentMethod: string
  shippingAddress: {
    street: string
    district?: string
    city: string
    country?: string
  }
  status: string
}

const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>()

  const { data: orderResponse, isLoading, isError } = useGetOrder(id!)

  // Safe access to data
  const order = orderResponse?.metadata as OrderResponse | undefined

  const handleCopyOrderId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id)
      toast.success('Đã sao chép mã đơn hàng!')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className='min-h-[80vh] flex items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='w-10 h-10 animate-spin text-primary' />
            <p className='text-muted-foreground'>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (isError || !order) {
    return (
      <Layout>
        <div className='min-h-[80vh] flex items-center justify-center'>
          <div className='text-center space-y-4'>
            <h2 className='text-2xl font-bold'>Không tìm thấy đơn hàng</h2>
            <p className='text-muted-foreground'>Có thể đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <Button variant='gold' asChild>
              <Link to='/'>Về trang chủ</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='min-h-[85vh] flex items-center justify-center py-16 bg-linear-to-b from-background to-secondary/20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto'>
            {/* Success Header */}
            <div className='text-center mb-10'>
              <div className='mb-6 relative inline-block'>
                <div className='absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse'></div>
                <div className='relative w-24 h-24 bg-background border-4 border-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20 animate-in zoom-in-50 duration-500 ease-out'>
                  <CheckCircle className='w-12 h-12 text-green-500 animate-in fade-in duration-500 delay-200 fill-mode-both' />
                </div>
              </div>

              <h1 className='text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-primary via-yellow-500 to-primary animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both'>
                Đặt hàng thành công!
              </h1>
              <p className='text-muted-foreground text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both'>
                Cảm ơn bạn đã tin tưởng lựa chọn BladeStyle
              </p>
            </div>

            {/* Order Info Card */}
            <div className='bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both'>
              {/* Order ID Bar */}
              <div className='bg-secondary/30 border-b border-border/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left'>
                <span className='text-sm text-muted-foreground'>Mã đơn hàng</span>
                <div className='flex items-center gap-2 bg-background/80 px-4 py-1.5 rounded-full border border-border dashed'>
                  <span className='font-mono font-bold text-primary tracking-wider'>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className='text-muted-foreground hover:text-primary transition-colors p-1'
                    title='Sao chép mã đơn hàng'
                  >
                    <Copy className='w-4 h-4' />
                  </button>
                </div>
              </div>

              <div className='p-6 md:p-8 space-y-8'>
                {/* Order Items */}
                <div>
                  <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
                    <Package className='w-5 h-5 text-primary' />
                    Sản phẩm đã đặt
                  </h3>
                  <div className='space-y-4'>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between p-4 bg-secondary/20 rounded-xl hover:bg-secondary/30 transition-colors'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-12 bg-background rounded-lg flex items-center justify-center border border-border'>
                            <span className='font-bold text-muted-foreground'>x{item.quantity}</span>
                          </div>
                          <div>
                            <p className='font-medium line-clamp-1'>{item.product?.name || 'Sản phẩm'}</p>
                            <p className='text-sm text-muted-foreground'>
                              {formatPrice(item.product?.price || item.price || 0)}
                            </p>
                          </div>
                        </div>
                        <span className='font-bold tabular-nums'>
                          {formatPrice((item.product?.price || item.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='grid sm:grid-cols-2 gap-6'>
                  {/* Payment Info */}
                  <div className='p-4 rounded-2xl bg-secondary/10 border border-border/40 space-y-2'>
                    <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                      <CreditCard className='w-4 h-4' />
                      <span className='text-sm'>Phương thức thanh toán</span>
                    </div>
                    <p className='font-medium'>{order.paymentMethod}</p>
                  </div>

                  {/* Shipping Info */}
                  <div className='p-4 rounded-2xl bg-secondary/10 border border-border/40 space-y-2'>
                    <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                      <Truck className='w-4 h-4' />
                      <span className='text-sm'>Giao hàng đến</span>
                    </div>
                    <p className='font-medium line-clamp-2'>
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                    </p>
                  </div>
                </div>

                {/* Total Breakdown */}
                <div className='space-y-3 pt-6 border-t border-border dashed'>
                  <div className='flex justify-between items-center text-muted-foreground'>
                    <span>Tạm tính</span>
                    {/* Assuming total price includes everything for now, or calculate sum */}
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className='flex justify-between items-center text-muted-foreground'>
                    <span>Phí vận chuyển</span>
                    <span className='text-green-500 font-medium'>Miễn phí</span>
                  </div>
                  <div className='flex justify-between items-center pt-2'>
                    <span className='text-lg font-semibold'>Tổng thanh toán</span>
                    <span className='text-2xl font-bold text-primary'>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground my-8'>
              <Phone className='w-4 h-4' />
              <span>
                Cần hỗ trợ đơn hàng? Gọi ngay:{' '}
                <a href='tel:19001234' className='text-primary font-bold hover:underline'>
                  1900 1234
                </a>
              </span>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both'>
              <Button size='lg' className='w-full sm:w-auto h-12 text-base shadow-xl shadow-primary/20' asChild>
                <Link to='/products' className='gap-2'>
                  Tiếp tục mua sắm
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='w-full sm:w-auto h-12 text-base border-primary/20 hover:bg-primary/5'
                asChild
              >
                <Link to='/'>Về trang chủ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default OrderSuccess
