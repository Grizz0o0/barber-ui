import { Link } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Scissors, Award, Users, Clock, MapPin, Phone, Star } from 'lucide-react'

const stats = [
  { icon: Users, value: '10,000+', label: 'Khách hàng tin tưởng' },
  { icon: Scissors, value: '50,000+', label: 'Lượt cắt thành công' },
  { icon: Award, value: '8+', label: 'Năm kinh nghiệm' },
  { icon: Star, value: '4.9', label: 'Đánh giá trung bình' }
]

const values = [
  {
    title: 'Chất lượng',
    description: 'Chúng tôi cam kết mang đến dịch vụ cắt tóc chất lượng cao nhất với kỹ thuật chuyên nghiệp.'
  },
  {
    title: 'Sáng tạo',
    description: 'Luôn cập nhật xu hướng mới nhất và sáng tạo trong từng đường cắt.'
  },
  {
    title: 'Tận tâm',
    description: 'Lắng nghe và thấu hiểu nhu cầu của khách hàng để mang đến sự hài lòng tuyệt đối.'
  },
  {
    title: 'Chuyên nghiệp',
    description: 'Đội ngũ thợ cắt được đào tạo bài bản với nhiều năm kinh nghiệm trong nghề.'
  }
]

import { useGetBarbers } from '@/queries/useAccount'
import type { User } from '@/types'

const About = () => {
  const { data: barbersData } = useGetBarbers()
  const barbers = (barbersData?.metadata || []) as User[]

  return (
    <Layout>
      {/* Hero Section */}
      <section className='relative py-20 md:py-32 bg-linear-to-b from-card to-background'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
              Về <span className='text-primary'>BarberShop</span>
            </h1>
            <p className='text-lg md:text-xl text-muted-foreground leading-relaxed'>
              Với hơn 8 năm kinh nghiệm, chúng tôi tự hào là địa chỉ cắt tóc nam uy tín hàng đầu, mang đến phong cách và
              sự tự tin cho hàng nghìn quý ông.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-card/50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center p-6 rounded-xl bg-background/50 border border-border/50'>
                <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                  <stat.icon className='w-6 h-6 text-primary' />
                </div>
                <div className='font-display text-3xl md:text-4xl font-bold text-primary mb-1'>{stat.value}</div>
                <p className='text-muted-foreground text-sm'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='font-display text-3xl md:text-4xl font-bold mb-6'>Câu chuyện của chúng tôi</h2>
              <div className='space-y-4 text-muted-foreground leading-relaxed'>
                <p>
                  BarberShop được thành lập năm 2016 với tâm huyết mang đến cho quý ông Việt Nam trải nghiệm cắt tóc
                  đẳng cấp như những barbershop hàng đầu thế giới.
                </p>
                <p>
                  Bắt đầu từ một cửa hàng nhỏ với 2 thợ cắt, sau 8 năm phát triển, chúng tôi đã xây dựng được đội ngũ
                  gồm 5 thợ cắt tay nghề cao và phục vụ hơn 10,000 khách hàng.
                </p>
                <p>
                  Chúng tôi không chỉ cắt tóc, mà còn tạo nên phong cách sống. Mỗi kiểu tóc là một tác phẩm nghệ thuật,
                  được tùy chỉnh riêng cho từng khuôn mặt và phong cách.
                </p>
              </div>
            </div>
            <div className='relative'>
              <div className='aspect-4/5 rounded-2xl overflow-hidden'>
                <img
                  src='https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=750&fit=crop'
                  alt='BarberShop interior'
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='absolute -bottom-6 -left-6 w-32 h-32 rounded-xl bg-primary flex items-center justify-center shadow-gold'>
                <div className='text-center text-primary-foreground'>
                  <div className='font-display text-3xl font-bold'>8+</div>
                  <div className='text-sm'>Năm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className='py-16 md:py-24 bg-card/30'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='font-display text-3xl md:text-4xl font-bold mb-4'>Giá trị cốt lõi</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Những giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {values.map((value, index) => (
              <Card key={index} className='bg-background/50 border-border/50 hover:border-primary/50 transition-colors'>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                    <span className='font-display text-xl font-bold text-primary'>{index + 1}</span>
                  </div>
                  <h3 className='font-display text-xl font-semibold mb-2'>{value.title}</h3>
                  <p className='text-muted-foreground text-sm'>{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='font-display text-3xl md:text-4xl font-bold mb-4'>Đội ngũ thợ cắt</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>Những nghệ nhân tài hoa với đôi bàn tay vàng</p>
          </div>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {barbers.slice(0, 4).map((barber) => (
              <div key={barber._id} className='group'>
                <div className='relative aspect-4/5 overflow-hidden rounded-2xl mb-4 border border-border/50 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-gold/20 group-hover:shadow-2xl'>
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500' />
                  <div className='absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
                    <p className='text-primary text-xs font-bold tracking-widest uppercase mb-1'>{barber.specialty}</p>
                    <h3 className='font-display text-xl font-bold text-foreground'>{barber.name}</h3>
                  </div>
                </div>
                <div className='flex items-center justify-between px-2'>
                  <div className='flex items-center gap-1.5'>
                    <Star className='w-4 h-4 fill-primary text-primary' />
                    <span className='font-bold text-sm'>{barber.rating}</span>
                  </div>
                  <span className='text-muted-foreground text-sm font-medium'>{barber.experience} năm kinh nghiệm</span>
                </div>
              </div>
            ))}
          </div>
          <div className='text-center mt-8'>
            <Link to='/booking'>
              <Button variant='gold' size='lg'>
                Xem tất cả & Đặt lịch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className='py-16 md:py-24 bg-card/30'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='font-display text-3xl md:text-4xl font-bold mb-4'>Liên hệ với chúng tôi</h2>
              <p className='text-muted-foreground'>Ghé thăm cửa hàng hoặc liên hệ để được tư vấn</p>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              <Card className='bg-background/50 border-border/50'>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                    <MapPin className='w-6 h-6 text-primary' />
                  </div>
                  <h3 className='font-semibold mb-2'>Địa chỉ</h3>
                  <p className='text-muted-foreground text-sm'>
                    123 Cầu Giấy, <br />
                    TP. Hà Nội
                  </p>
                </CardContent>
              </Card>
              <Card className='bg-background/50 border-border/50'>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                    <Phone className='w-6 h-6 text-primary' />
                  </div>
                  <h3 className='font-semibold mb-2'>Điện thoại</h3>
                  <p className='text-muted-foreground text-sm'>
                    Hotline: 1900 1234
                    <br />
                    Mobile: 0901 234 567
                  </p>
                </CardContent>
              </Card>
              <Card className='bg-background/50 border-border/50'>
                <CardContent className='p-6 text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                    <Clock className='w-6 h-6 text-primary' />
                  </div>
                  <h3 className='font-semibold mb-2'>Giờ mở cửa</h3>
                  <p className='text-muted-foreground text-sm'>
                    T2 - CN: 8:00 - 21:00
                    <br />
                    Nghỉ lễ: Theo lịch
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold mb-4'>Sẵn sàng thay đổi phong cách?</h2>
            <p className='text-muted-foreground mb-8'>Đặt lịch ngay hôm nay để trải nghiệm dịch vụ cắt tóc đẳng cấp</p>
            <Link to='/booking'>
              <Button variant='gold' size='lg'>
                Đặt lịch ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default About
