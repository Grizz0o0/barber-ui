import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, ArrowRight, Shield, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import heroImage from '@/assets/hero-barbershop.jpg'
import { formatPrice } from '@/lib/constants'
import { useGetServices } from '@/queries/useService'
import { useGetBarbers } from '@/queries/useAccount'
import { useGetReviews } from '@/queries/useReview'
import type { Review, User, Service } from '@/types'
import SEO from '@/components/common/SEO'
import PageLoader from '@/components/common/PageLoader'

const features = [
  {
    icon: Star,
    title: 'Thợ cắt chuyên nghiệp',
    description: 'Đội ngũ thợ cắt được đào tạo bài bản với nhiều năm kinh nghiệm trong nghề'
  },
  {
    icon: Clock,
    title: 'Đặt lịch linh hoạt',
    description: 'Đặt lịch online 24/7 qua ứng dụng, không cần chờ đợi hay gọi điện'
  },
  {
    icon: Shield,
    title: 'Sản phẩm cao cấp',
    description: 'Sử dụng các sản phẩm chăm sóc tóc hàng đầu thế giới được nhập khẩu chính hãng'
  }
]

const Index = () => {
  const { data: servicesData, isLoading: isLoadingServices } = useGetServices()
  const { data: barbersData, isLoading: isLoadingBarbers } = useGetBarbers()
  // Fetch top 3 reviews, assuming hook defaults page=1, limit=10. Need custom params if hook supports.
  // Viewing useReview: export const useGetReviews = (page = 1, limit = 10) => ...
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetReviews(1, 3)

  const services = useMemo(() => {
    return servicesData?.metadata?.services?.slice(0, 3) || []
  }, [servicesData])

  const barbers = useMemo(() => {
    return barbersData?.metadata?.slice(0, 5) || []
  }, [barbersData])

  const reviews = useMemo(() => {
    return reviewsData?.metadata?.reviews || []
  }, [reviewsData])

  const isLoading = isLoadingServices || isLoadingBarbers || isLoadingReviews

  if (isLoading) {
    return <PageLoader fullScreen />
  }

  return (
    <Layout>
      <SEO
        title='Trang chủ'
        description='BarberShop - Hệ thống cắt tóc nam chuyên nghiệp hàng đầu. Đặt lịch ngay để trải nghiệm dịch vụ đẳng cấp.'
      />
      {/* Hero Section */}
      <section className='relative min-h-[90vh] flex items-center'>
        {/* Background Image */}
        <div className='absolute inset-0 z-0'>
          <img src={heroImage} alt='Không gian tiệm cắt tóc nam' className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/50' />
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-2xl'>
            <h1 className='mb-6 animate-fade-in'>
              <span className='text-foreground'>Phong cách </span>
              <span className='text-gradient'>đẳng cấp</span>
              <br />
              <span className='text-foreground'>cho quý ông</span>
            </h1>
            <p className='text-lg text-muted-foreground mb-8 animate-fade-in' style={{ animationDelay: '0.2s' }}>
              Nâng tầm phong cách với dịch vụ cắt tóc chuyên nghiệp. Đội ngũ barber giàu kinh nghiệm sẵn sàng phục vụ
              bạn.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 animate-fade-in' style={{ animationDelay: '0.4s' }}>
              <Link to='/booking'>
                <Button variant='gold' size='lg'>
                  Đặt lịch ngay
                  <ArrowRight className='w-5 h-5' />
                </Button>
              </Link>
              <Link to='/services'>
                <Button variant='outline' size='lg'>
                  Xem dịch vụ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className='py-20 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='mb-4'>
              <span className='text-gradient'>Dịch vụ</span> nổi bật
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Trải nghiệm dịch vụ cắt tóc đẳng cấp với các gói dịch vụ được yêu thích nhất
            </p>
          </div>

          {!isLoading && services.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {services.map((service: Service, index: number) => (
                <div
                  key={service._id || index}
                  className='group bg-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/50'
                >
                  <div className='relative h-48 mb-6 overflow-hidden rounded-xl'>
                    <img
                      src={service.images?.[0] || 'https://placehold.co/600x400?text=Service'}
                      alt={service.name}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                    <div className='absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary shadow-sm'>
                      {formatPrice(service.price)}
                    </div>
                  </div>
                  <h3 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>{service.name}</h3>
                  <p className='text-muted-foreground mb-4 line-clamp-2'>{service.description}</p>
                  <div className='flex items-center text-sm text-muted-foreground mb-6'>
                    <Clock className='w-4 h-4 mr-2 text-primary' />
                    {service.duration} phút
                  </div>
                  <Link to='/booking'>
                    <Button className='w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                      Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-muted-foreground pb-8'>Đang cập nhật dịch vụ...</div>
          )}

          <div className='text-center mt-12'>
            <Link to='/services'>
              <Button variant='outline' size='lg'>
                Xem tất cả dịch vụ
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className='section bg-secondary/30'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-2xl mx-auto mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Đội Ngũ Barber</h2>
            <p className='text-muted-foreground text-lg'>
              Những nghệ nhân tạo mẫu tóc chuyên nghiệp, tận tâm và giàu kinh nghiệm
            </p>
          </div>

          {!isLoading && barbers.length > 0 ? (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
              {barbers.map((barber: User, index: number) => (
                <div
                  key={barber._id || index}
                  className='bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50 group'
                >
                  <div className='aspect-square overflow-hidden relative'>
                    <img
                      src={barber.avatar || 'https://placehold.co/400x400?text=Barber'}
                      alt={barber.name}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                      <div className='text-white'>
                        <p className='font-medium text-sm'>{barber.specialty || 'Stylist'}</p>
                        <div className='flex items-center text-yellow-500 text-sm mt-1'>
                          <Star className='w-4 h-4 fill-current mr-1' />
                          {barber.rating?.toFixed(1) || '5.0'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='p-4 text-center'>
                    <h3 className='font-bold text-lg mb-1'>{barber.name}</h3>
                    <p className='text-sm text-muted-foreground line-clamp-1'>
                      {barber.experience ? `${barber.experience} năm kinh nghiệm` : 'Chuyên nghiệp'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-muted-foreground'>Đang cập nhật đội ngũ...</div>
          )}
          <div className='text-center mt-12'>
            <Link to='/about'>
              <Button variant='outline' size='lg'>
                Xem thêm về chúng tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className='py-20 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='mb-4'>
              Tại sao chọn <span className='text-gradient'>BarberShop</span>?
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Chúng tôi cam kết mang đến trải nghiệm tốt nhất cho khách hàng
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className='text-center animate-fade-in'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_30px_hsl(38_92%_50%/0.3)]'>
                  <feature.icon className='w-7 h-7 text-primary-foreground' />
                </div>
                <h3 className='text-lg font-semibold mb-3 text-foreground'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='section md:px-0'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-2xl mx-auto mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Khách Hàng Nói Gì?</h2>
            <p className='text-muted-foreground text-lg'>Hàng ngàn khách hàng đã hài lòng với dịch vụ của chúng tôi</p>
          </div>

          {!isLoading && reviews.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {reviews.map((testimonial: Review, index: number) => {
                const rating = testimonial.rating || 5
                const reviewerName = testimonial.user?.name || 'Khách hàng'
                const reviewerAvatar = testimonial.user?.avatar || 'https://github.com/shadcn.png'

                return (
                  <div
                    key={testimonial._id}
                    className='p-6 rounded-xl bg-card border border-border animate-fade-in'
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Quote className='w-8 h-8 text-primary/30 mb-4' />
                    <p className='text-foreground mb-4 italic'>"{testimonial.comment}"</p>
                    <div className='flex items-center gap-3'>
                      <img src={reviewerAvatar} alt={reviewerName} className='w-10 h-10 rounded-full object-cover' />
                      <div>
                        <p className='font-semibold text-foreground text-sm'>{reviewerName}</p>
                        <div className='flex items-center gap-1'>
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className='w-3 h-3 fill-primary text-primary' />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='text-center text-muted-foreground'>Chưa có đánh giá nào.</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='mb-6'>
              Sẵn sàng thay đổi <span className='text-gradient'>phong cách</span>?
            </h2>
            <p className='text-muted-foreground text-lg mb-8'>
              Đặt lịch ngay hôm nay và trải nghiệm dịch vụ cắt tóc đẳng cấp nhất
            </p>
            <Link to='/booking'>
              <Button variant='gold' size='lg'>
                Đặt lịch ngay
                <ArrowRight className='w-5 h-5' />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Index
