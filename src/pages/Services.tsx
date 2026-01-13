import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout/Layout'
import { formatPrice, formatDuration } from '@/lib/constants'
import SEO from '@/components/common/SEO'
import PageLoader from '@/components/common/PageLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useGetServices } from '@/queries/useService'

interface Service {
  _id: string
  name: string
  duration: number
  price: number
  description?: string
  images?: string[]
}

const Services = () => {
  const { data: servicesData, isLoading } = useGetServices()
  const services: Service[] = servicesData?.metadata?.services || []

  return (
    <Layout>
      <SEO
        title='Dịch vụ'
        description='Trải nghiệm dịch vụ cắt tóc nam đẳng cấp với đội ngũ barber chuyên nghiệp tại BarberShop'
      />

      {/* Hero */}
      <section className='py-16 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='mb-4'>
              <span className='text-gradient'>Dịch vụ</span> của chúng tôi
            </h1>
            <p className='text-muted-foreground text-lg'>
              Trải nghiệm dịch vụ cắt tóc đẳng cấp với đội ngũ barber chuyên nghiệp và không gian sang trọng
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          {isLoading ? (
            <PageLoader />
          ) : services.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {services.map((service, index) => (
                <div
                  key={service._id}
                  className='group rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_4px_30px_hsl(38_92%_50%/0.1)] animate-fade-in overflow-hidden'
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={
                        service.images?.[0] ||
                        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop'
                      }
                      alt={service.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  </div>
                  <div className='p-5'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='text-base font-semibold text-foreground group-hover:text-primary transition-colors'>
                        {service.name}
                      </h3>
                      <div className='flex items-center gap-1 text-muted-foreground text-sm'>
                        <Clock className='w-4 h-4' />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>

                    <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>{service.description}</p>

                    <div className='flex items-center justify-between pt-4 border-t border-border'>
                      <p className='text-primary font-bold text-lg'>{formatPrice(service.price)}</p>
                      <Link to='/booking'>
                        <Button variant='outline' size='sm'>
                          Đặt lịch
                          <ArrowRight className='w-4 h-4' />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Scissors}
              title='Chưa có dịch vụ'
              description='Hiện tại chúng tôi đang cập nhật danh sách dịch vụ. Vui lòng quay lại sau.'
            />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 bg-card'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-4'>Bạn muốn đặt lịch?</h2>
          <p className='text-muted-foreground mb-6'>Chọn dịch vụ và thời gian phù hợp với bạn</p>
          <Link to='/booking'>
            <Button variant='gold' size='lg'>
              Đặt lịch ngay
              <ArrowRight className='w-5 h-5' />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export default Services
