import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import { toast } from 'sonner'
import { useGetCart, useUpdateCartQuantityMutation, useRemoveCartItemMutation } from '@/queries/useCart'

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const Cart = () => {
  const { data: cartData, isLoading } = useGetCart()
  const cart = (cartData?.metadata?.items || []) as CartItem[]

  const updateQuantityMutation = useUpdateCartQuantityMutation()
  const removeItemMutation = useRemoveCartItemMutation()

  const updateQuantity = (productId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta
    if (newQuantity < 1) return

    updateQuantityMutation.mutate(
      { product: productId, quantity: newQuantity },
      {
        onError: () => toast.error('Không thể cập nhật số lượng')
      }
    )
  }

  const removeItem = (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

    removeItemMutation.mutate(productId, {
      onSuccess: () => {
        toast.success('Đã xóa sản phẩm', {
          description: 'Sản phẩm đã được xóa khỏi giỏ hàng'
        })
      },
      onError: () => toast.error('Không thể xóa sản phẩm')
    })
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (isLoading) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <section className='py-20'>
          <div className='container mx-auto px-4 text-center'>
            <div className='max-w-md mx-auto'>
              <ShoppingBag className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h1 className='font-display text-2xl font-bold mb-4'>Giỏ hàng trống</h1>
              <p className='text-muted-foreground mb-6'>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <Link to='/products'>
                <Button variant='gold'>
                  Xem sản phẩm
                  <ArrowRight className='w-4 h-4' />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <h1 className='font-display text-3xl font-bold mb-8'>
            Giỏ <span className='text-gradient'>hàng</span>
          </h1>

          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Cart Items */}
            <div className='lg:col-span-2 space-y-4'>
              {cart.map((item) => (
                <div key={item.product._id} className='flex gap-4 p-4 bg-card border border-border rounded-xl'>
                  <img
                    src={
                      item.product.images?.[0] ||
                      'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=100&h=100&fit=crop'
                    }
                    alt={item.product.name}
                    className='w-24 h-24 object-cover rounded-lg'
                  />
                  <div className='flex-1'>
                    <h3 className='font-semibold text-foreground mb-1'>{item.product.name}</h3>
                    <p className='text-primary font-bold'>{formatPrice(item.product.price)}</p>

                    <div className='flex items-center justify-between mt-4'>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => updateQuantity(item.product._id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        >
                          <Minus className='w-4 h-4' />
                        </Button>
                        <span className='w-8 text-center font-medium'>{item.quantity}</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => updateQuantity(item.product._id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className='w-4 h-4' />
                        </Button>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive'
                        onClick={() => removeItem(item.product._id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className='lg:col-span-1'>
              <div className='bg-card border border-border rounded-xl p-6 sticky top-24'>
                <h2 className='font-display text-xl font-bold mb-4'>Tóm tắt đơn hàng</h2>

                <div className='space-y-3 mb-6'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Tạm tính</span>
                    <span className='text-foreground'>{formatPrice(total)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Phí vận chuyển</span>
                    <span className='text-foreground'>Miễn phí</span>
                  </div>
                  <div className='border-t border-border pt-3'>
                    <div className='flex justify-between'>
                      <span className='font-semibold'>Tổng cộng</span>
                      <span className='text-primary font-bold text-xl'>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <Link to='/checkout'>
                  <Button variant='gold' className='w-full' size='lg'>
                    Thanh toán
                    <ArrowRight className='w-4 h-4' />
                  </Button>
                </Link>

                <Link to='/products' className='block mt-4'>
                  <Button variant='outline' className='w-full'>
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Cart
