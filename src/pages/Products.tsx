import { useState } from 'react'
import { ShoppingCart, Star, Filter, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import SEO from '@/components/common/SEO'
import PageLoader from '@/components/common/PageLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'sonner'
import { formatPrice, productCategories } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import type { Product } from '@/types'
import { useGetProducts } from '@/queries/useProduct'
import { useAddToCartMutation } from '@/queries/useCart'

const Products = () => {
  const { isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: productsData, isLoading } = useGetProducts(1, 100)
  const products: Product[] = productsData?.metadata?.products || []

  const addToCartMutation = useAddToCartMutation()

  const filteredProducts = products.filter(
    (product) => selectedCategory === 'all' || product.category === selectedCategory
  )

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      return
    }

    addToCartMutation.mutate(
      { product: product._id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Đã thêm vào giỏ hàng', {
            description: `${product.name} đã được thêm vào giỏ hàng`
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

  return (
    <Layout>
      <SEO title='Sản phẩm' description='Mua sắm các sản phẩm chăm sóc tóc, sáp vuốt tóc chính hãng tại BarberShop' />
      {/* Hero */}
      <section className='py-16 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='mb-4'>
              <span className='text-gradient'>Sản phẩm</span> chính hãng
            </h1>
            <p className='text-muted-foreground text-lg'>
              Các sản phẩm chăm sóc tóc cao cấp được tin dùng bởi các barber chuyên nghiệp
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          {/* Filter */}
          <div className='flex items-center gap-4 mb-8 overflow-x-auto pb-2'>
            <Filter className='w-5 h-5 text-muted-foreground shrink-0' />
            {productCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'gold' : 'outline'}
                size='sm'
                onClick={() => setSelectedCategory(category.id)}
                className='shrink-0'
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <PageLoader />
          ) : filteredProducts.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className='group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_4px_30px_hsl(38_92%_50%/0.1)] animate-fade-in'
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div className='relative aspect-square overflow-hidden bg-secondary'>
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop'
                      }
                      alt={product.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  </div>

                  {/* Content */}
                  <div className='p-4'>
                    <div className='flex items-center gap-1 mb-2'>
                      <Star className='w-4 h-4 fill-primary text-primary' />
                      <span className='text-sm font-medium text-foreground'>{product.rating || '5.0'}</span>
                      <span className='text-xs text-muted-foreground'>({product.ratingCount || 0})</span>
                    </div>

                    <h3 className='text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 overflow-hidden'>
                      {product.name}
                    </h3>
                    <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>{product.description}</p>

                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-primary font-bold text-lg'>{formatPrice(product.price)}</p>
                      </div>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleAddToCart(product)}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title='Không tìm thấy sản phẩm'
              description='Không có sản phẩm nào phù hợp với bộ lọc này.'
            />
          )}
        </div>
      </section>
    </Layout>
  )
}

export default Products
