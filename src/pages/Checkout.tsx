import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CreditCard, Smartphone, Banknote, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { formatPrice, PaymentMethod } from '@/lib/constants'
import { useGetCart } from '@/queries/useCart'
import { useCreateOrderMutation } from '@/queries/useOrder'
import { useCreateMomoPaymentMutation } from '@/queries/usePayment'
import { useAuth } from '@/contexts/AuthContext'

// Schema Validation
const checkoutSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
}

const Checkout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.MOMO)

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  })

  // Debug form errors
  // console.log('Form Errors:', errors)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      console.log('User detected:', user)
      const addressStr =
        typeof user.address === 'string'
          ? user.address
          : user.address
            ? [user.address.street, user.address.district, user.address.city].filter(Boolean).join(', ')
            : ''

      setValue('name', user.name || '')
      setValue('email', user.email || '')
      setValue('phone', user.phone || '')
      setValue('address', addressStr)
    }
  }, [user, setValue])

  // Fetch cart
  const { data: cartData, isLoading: isLoadingCart } = useGetCart()

  const cartItems: CartItem[] = cartData?.metadata?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = 0
  const total = subtotal + shipping

  const createMomoPaymentMutation = useCreateMomoPaymentMutation()

  // Create order mutation
  const createOrderMutation = useCreateOrderMutation()

  const onSubmit = (data: CheckoutFormValues) => {
    const orderData = {
      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      shippingAddress: {
        street: data.address,
        city: 'Hà Nội', // Simplifying for now
        country: 'Vietnam'
      },
      paymentMethod:
        paymentMethod === PaymentMethod.MOMO ? 'MoMo' : paymentMethod === PaymentMethod.BANKING ? 'Banking' : 'Cash',
      totalPrice: total,
      // Note: Backend might need contact info like name/phone if not authenticated or for shipping label.
      // Assuming backend extracts user from token or we pass it if needed.
      // If backend logic relies on user profile, we might need to update user profile or pass these fields.
      // For this refactor, we focus on frontend validation.
      contactInfo: {
        name: data.name,
        phone: data.phone,
        email: data.email
      }
    }

    createOrderMutation.mutate(orderData as any, {
      onSuccess: async (data: any) => {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        const orderId = data.metadata._id

        if (paymentMethod === PaymentMethod.MOMO) {
          try {
            toast.loading('Đang chuyển hướng đến MoMo...')
            createMomoPaymentMutation.mutate(
              {
                amount: total,
                orderId: orderId,
                orderInfo: `Thanh toan don hang #${orderId.slice(-6).toUpperCase()}`
              },
              {
                onSuccess: (paymentRes) => {
                  if (paymentRes.metadata?.payUrl) {
                    window.location.assign(paymentRes.metadata.payUrl)
                  } else {
                    toast.error('Không lấy được link thanh toán MoMo')
                    navigate(`/order-success/${orderId}`)
                  }
                },
                onError: (err) => {
                  console.error('MoMo payment failed', err)
                  toast.error('Lỗi khi khởi tạo thanh toán MoMo')
                  navigate(`/order-success/${orderId}`)
                }
              }
            )
          } catch (err) {
            console.error('MoMo payment failed', err) // This catch might not catch hook errors if synchronous but safety net.
            navigate(`/order-success/${orderId}`)
          }
        } else {
          toast.success('Đặt hàng thành công!')
          navigate(`/order-success/${orderId}`)
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Có lỗi xảy ra khi đặt hàng')
      }
    })
  }

  return (
    <Layout>
      <section className='py-16 md:py-20 bg-linear-to-b from-card to-background'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='font-display text-4xl md:text-5xl font-bold mb-4'>
              Thanh toán <span className='text-primary'>Đơn hàng</span>
            </h1>
            <p className='text-muted-foreground text-lg'>
              Hoàn tất đơn hàng của bạn với phương thức thanh toán an toàn và bảo mật
            </p>
          </div>
        </div>
      </section>

      <section className='pb-12 md:pb-16'>
        <div className='container mx-auto px-4'>
          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log('Form Validation Errors:', errors)
              toast.error('Vui lòng kiểm tra lại thông tin đơn hàng')
            })}
          >
            <div className='grid lg:grid-cols-3 gap-8'>
              {/* Left - Form */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Customer Info */}
                <Card className='bg-card/50 border-border/50'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Thông tin người nhận</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Họ tên *</Label>
                        <Input
                          id='name'
                          placeholder='Nguyễn Văn A'
                          {...register('name')}
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='phone'>Số điện thoại *</Label>
                        <Input
                          id='phone'
                          placeholder='0901234567'
                          {...register('phone')}
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <p className='text-destructive text-sm'>{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email *</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='email@example.com'
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='address'>Địa chỉ nhận hàng</Label>
                      <Input
                        id='address'
                        placeholder='Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành'
                        {...register('address')}
                        className={errors.address ? 'border-destructive' : ''}
                      />
                      {errors.address && <p className='text-destructive text-sm'>{errors.address.message}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className='bg-card/50 border-border/50'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Phương thức thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className='space-y-3'>
                        <label
                          htmlFor='cash'
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            paymentMethod === PaymentMethod.CASH
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={PaymentMethod.CASH} id='cash' />
                          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-green-500'>
                            <Banknote className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <p className='font-medium'>Thanh toán khi nhận hàng</p>
                            <p className='text-sm text-muted-foreground'>Thanh toán tiền mặt khi nhận hàng</p>
                          </div>
                        </label>
                        <label
                          htmlFor='momo'
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            paymentMethod === PaymentMethod.MOMO
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={PaymentMethod.MOMO} id='momo' />
                          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-pink-500'>
                            <Smartphone className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <p className='font-medium'>Ví MoMo</p>
                            <p className='text-sm text-muted-foreground'>Thanh toán nhanh qua ví MoMo</p>
                          </div>
                        </label>
                        <label
                          htmlFor='banking'
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            paymentMethod === PaymentMethod.BANKING
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={PaymentMethod.BANKING} id='banking' />
                          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-blue-500'>
                            <CreditCard className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <p className='font-medium'>Chuyển khoản ngân hàng</p>
                            <p className='text-sm text-muted-foreground'>Chuyển khoản qua Internet Banking</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === PaymentMethod.MOMO && (
                      <div className='mt-6 p-4 bg-pink-500/10 rounded-lg border border-pink-500/20'>
                        <div className='flex items-center gap-3 mb-3'>
                          <Smartphone className='w-8 h-8 text-pink-500' />
                          <div>
                            <p className='font-medium text-pink-500'>Thanh toán MoMo</p>
                            <p className='text-sm text-muted-foreground'>Quét mã QR hoặc nhập số điện thoại</p>
                          </div>
                        </div>
                        <div className='bg-background rounded-lg p-4 text-center'>
                          <div className='w-40 h-40 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center'>
                            <span className='text-muted-foreground text-sm'>QR Code MoMo</span>
                          </div>
                          <p className='text-sm text-muted-foreground'>Mở app MoMo và quét mã để thanh toán</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === PaymentMethod.BANKING && (
                      <div className='mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20'>
                        <p className='font-medium text-blue-500 mb-3'>Thông tin chuyển khoản</p>
                        <div className='space-y-2 text-sm'>
                          <p>
                            <span className='text-muted-foreground'>Ngân hàng:</span> Vietcombank
                          </p>
                          <p>
                            <span className='text-muted-foreground'>Số tài khoản:</span> 0123456789
                          </p>
                          <p>
                            <span className='text-muted-foreground'>Chủ tài khoản:</span> BARBERSHOP JSC
                          </p>
                          <p>
                            <span className='text-muted-foreground'>Nội dung:</span> [Tên] - [SĐT]
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right - Order Summary */}
              <div>
                <Card className='bg-card/50 border-border/50 sticky top-24'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Đơn hàng của bạn</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {isLoadingCart ? (
                      <div className='flex justify-center p-4'>
                        <Loader2 className='animate-spin' />
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.product._id} className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            {item.product.name} x{item.quantity}
                          </span>
                          <span>{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))
                    )}
                    <Separator />
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Phí vận chuyển</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <Separator />
                    <div className='flex justify-between font-semibold text-lg'>
                      <span>Tổng cộng</span>
                      <span className='text-primary'>{formatPrice(total)}</span>
                    </div>

                    <Button
                      type='submit'
                      variant='gold'
                      className='w-full'
                      size='lg'
                      disabled={createOrderMutation.isPending || isLoadingCart || !cartItems.length}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Đang xử lý...
                        </>
                      ) : (
                        <>Xác nhận thanh toán</>
                      )}
                    </Button>
                    {!cartItems.length && !isLoadingCart && (
                      <p className='text-center text-destructive text-sm mt-2'>Giỏ hàng trống</p>
                    )}

                    <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                      <ShieldCheck className='w-4 h-4' />
                      <span>Thanh toán an toàn & bảo mật</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  )
}

export default Checkout
