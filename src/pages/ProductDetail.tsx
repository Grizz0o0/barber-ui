import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, ChevronLeft, Check, Package, Truck, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/layout/Layout'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import { useGetProduct, useGetProducts } from '@/queries/useProduct'
import { useAddToCartMutation } from '@/queries/useCart'
import type { Product } from '@/types'
import { StarRating } from '@/components/common/StarRating'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { data: productData, isLoading: isLoadingProduct } = useGetProduct(id || '')
  const product = productData?.metadata || null

  const { data: relatedProductsData } = useGetProducts(1, 4)
  const relatedProducts = (relatedProductsData?.metadata?.products || [])
    .filter((p: Product) => p._id !== id)
    .slice(0, 4)

  const isLoading = isLoadingProduct

  const addToCartMutation = useAddToCartMutation()

  if (isLoading) {
    return (
      <Layout>
        <div className='flex justify-center py-20'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className='container mx-auto px-4 py-20 text-center'>
          <h1 className='text-2xl font-bold mb-4'>Sản phẩm không tồn tại</h1>
          <Button variant='gold' onClick={() => navigate('/products')}>
            Quay lại cửa hàng
          </Button>
        </div>
      </Layout>
    )
  }

  const images = product.images || []
  // If no images, use a placeholder
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop')
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      navigate('/login')
      return
    }

    if (!product) return

    addToCartMutation.mutate(
      { product: product._id, quantity },
      {
        onSuccess: () => {
          toast.success('Đã thêm vào giỏ hàng', {
            description: `${quantity} x ${product.name}`
          })
        },
        onError: (error: any) => {
          toast.error('Thêm vào giỏ hàng thất bại', {
            description: error.message
          })
        }
      }
    )
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      navigate('/login')
      return
    }

    if (!product) return

    addToCartMutation.mutate(
      { product: product._id, quantity },
      {
        onSuccess: () => {
          toast.success('Đã thêm vào giỏ hàng', {
            description: `${quantity} x ${product.name}`
          })
          navigate('/cart')
        },
        onError: (error: any) => {
          toast.error('Thêm vào giỏ hàng thất bại', {
            description: error.message
          })
        }
      }
    )
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className='bg-card/50 py-4'>
        <div className='container mx-auto px-4'>
          <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Link to='/' className='hover:text-primary transition-colors'>
              Trang chủ
            </Link>
            <span>/</span>
            <Link to='/products' className='hover:text-primary transition-colors'>
              Sản phẩm
            </Link>
            <span>/</span>
            <span className='text-foreground'>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='grid lg:grid-cols-2 gap-12'>
            {/* Images */}
            <div className='space-y-4'>
              <div className='relative aspect-square rounded-2xl overflow-hidden bg-secondary'>
                <img src={images[selectedImage]} alt={product.name} className='w-full h-full object-cover' />
              </div>
              {images.length > 1 && (
                <div className='flex gap-3'>
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt='' className='w-full h-full object-cover' />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className='space-y-6'>
              <div>
                <Badge variant='secondary' className='mb-3'>
                  {product.category}
                </Badge>
                <h1 className='text-3xl md:text-4xl font-bold mb-4'>{product.name}</h1>

                <div className='flex items-center gap-4 mb-4'>
                  <StarRating rating={Math.round(product.rating || 5)} size='md' />
                  <span className='font-medium'>{product.rating || 5}</span>
                  <span className='text-muted-foreground'>({product.ratingCount || 0} đánh giá)</span>
                </div>

                <div className='flex items-baseline gap-3 mb-6'>
                  <span className='text-4xl font-bold text-primary'>{formatPrice(product.price)}</span>
                </div>

                <p className='text-muted-foreground text-lg leading-relaxed'>{product.description}</p>
              </div>

              {/* Stock */}
              <div className='flex items-center gap-2'>
                <Check className='w-5 h-5 text-green-500' />
                <span className='text-green-500 font-medium'>Còn {product.stock || 0} sản phẩm</span>
              </div>

              {/* Quantity */}
              <div className='flex items-center gap-4'>
                <span className='font-medium'>Số lượng:</span>
                <div className='flex items-center gap-3 bg-card border border-border rounded-lg p-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className='w-4 h-4' />
                  </Button>
                  <span className='w-12 text-center font-medium'>{quantity}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    disabled={quantity >= (product.stock || 0)}
                  >
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-4 pt-4'>
                <Button
                  variant='outline'
                  size='lg'
                  className='flex-1'
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className='w-5 h-5 animate-spin' />
                  ) : (
                    <>
                      <ShoppingCart className='w-5 h-5 mr-2' />
                      Thêm vào giỏ
                    </>
                  )}
                </Button>
                <Button
                  variant='gold'
                  size='lg'
                  className='flex-1'
                  onClick={handleBuyNow}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Mua ngay'}
                </Button>
              </div>

              {/* Benefits */}
              <div className='grid grid-cols-3 gap-4 pt-6 border-t border-border'>
                <div className='text-center'>
                  <Package className='w-8 h-8 mx-auto mb-2 text-primary' />
                  <p className='text-sm text-muted-foreground'>Hàng chính hãng</p>
                </div>
                <div className='text-center'>
                  <Truck className='w-8 h-8 mx-auto mb-2 text-primary' />
                  <p className='text-sm text-muted-foreground'>Giao hàng nhanh</p>
                </div>
                <div className='text-center'>
                  <Shield className='w-8 h-8 mx-auto mb-2 text-primary' />
                  <p className='text-sm text-muted-foreground'>Đổi trả 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className='py-12 bg-card/30'>
        <div className='container mx-auto px-4'>
          <Tabs defaultValue='description' className='max-w-4xl mx-auto'>
            <TabsList className='w-full grid grid-cols-3 mb-8'>
              <TabsTrigger value='description'>Mô tả chi tiết</TabsTrigger>
              <TabsTrigger value='ingredients'>Thành phần</TabsTrigger>
              <TabsTrigger value='usage'>Hướng dẫn sử dụng</TabsTrigger>
            </TabsList>

            <TabsContent value='description' className='prose prose-invert max-w-none'>
              <div className='bg-card rounded-xl p-8'>
                <h3 className='text-xl font-semibold mb-4'>Mô tả sản phẩm</h3>
                <p className='text-muted-foreground mb-4'>{product.description}</p>
                <ul className='space-y-2 text-muted-foreground'>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <span>Sản phẩm chính hãng, nguồn gốc rõ ràng</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <span>Được các barber chuyên nghiệp tin dùng</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <span>Phù hợp với mọi loại tóc</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <span>Không gây hại cho tóc và da đầu</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value='ingredients' className='prose prose-invert max-w-none'>
              <div className='bg-card rounded-xl p-8'>
                <h3 className='text-xl font-semibold mb-4'>Thành phần chính</h3>
                <ul className='space-y-3 text-muted-foreground'>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <div>
                      <span className='font-medium text-foreground'>Vitamin E:</span> Nuôi dưỡng tóc, chống oxy hóa
                    </div>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <div>
                      <span className='font-medium text-foreground'>Keratin:</span> Phục hồi cấu trúc tóc hư tổn
                    </div>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <div>
                      <span className='font-medium text-foreground'>Tinh dầu tự nhiên:</span> Tạo độ bóng tự nhiên
                    </div>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='w-5 h-5 text-primary mt-0.5' />
                    <div>
                      <span className='font-medium text-foreground'>Protein:</span> Tăng cường độ đàn hồi cho tóc
                    </div>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value='usage' className='prose prose-invert max-w-none'>
              <div className='bg-card rounded-xl p-8'>
                <h3 className='text-xl font-semibold mb-4'>Hướng dẫn sử dụng</h3>
                <ol className='space-y-4 text-muted-foreground'>
                  <li className='flex gap-4'>
                    <span className='shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      1
                    </span>
                    <p>Làm ẩm tóc hoặc sử dụng trên tóc khô tùy loại sản phẩm</p>
                  </li>
                  <li className='flex gap-4'>
                    <span className='shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      2
                    </span>
                    <p>Lấy một lượng vừa đủ (khoảng bằng đầu ngón tay) ra tay</p>
                  </li>
                  <li className='flex gap-4'>
                    <span className='shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      3
                    </span>
                    <p>Xoa đều sản phẩm trong lòng bàn tay cho tan đều</p>
                  </li>
                  <li className='flex gap-4'>
                    <span className='shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      4
                    </span>
                    <p>Vuốt đều lên tóc và tạo kiểu theo ý muốn</p>
                  </li>
                  <li className='flex gap-4'>
                    <span className='shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold'>
                      5
                    </span>
                    <p>Có thể sử dụng máy sấy để cố định kiểu tóc lâu hơn</p>
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className='py-12'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold mb-8'>Sản phẩm liên quan</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {relatedProducts.map((p: Product) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className='group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all'
                >
                  <div className='aspect-square overflow-hidden bg-secondary'>
                    <img
                      src={
                        p.images?.[0] ||
                        'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop'
                      }
                      alt={p.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  </div>
                  <div className='p-4'>
                    <div className='flex items-center gap-1 mb-2'>
                      <StarRating rating={Math.round(p.rating || 5)} size='sm' />
                      <span className='text-sm font-medium ml-1'>{p.rating || 5}</span>
                    </div>
                    <h3 className='font-semibold group-hover:text-primary transition-colors line-clamp-1'>{p.name}</h3>
                    <p className='text-primary font-bold mt-2'>{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Button */}
      <div className='container mx-auto px-4 pb-12'>
        <Button variant='ghost' onClick={() => navigate('/products')}>
          <ChevronLeft className='w-4 h-4 mr-2' />
          Quay lại cửa hàng
        </Button>
      </div>
    </Layout>
  )
}

export default ProductDetail
