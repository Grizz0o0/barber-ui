import { Link } from 'react-router-dom'
import { Scissors, MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'
import { SHOP_INFO, NAV_LINKS } from '@/lib/constants'
import { useGetSystemConfig } from '@/queries/useSystemConfig'

const Footer = () => {
  const { data: configData } = useGetSystemConfig()
  const shopInfo = configData?.metadata || SHOP_INFO

  // Helper to safely access nested properties in case backend returns incomplete data
  const workingHours = shopInfo.workingHours || SHOP_INFO.workingHours
  const socials = shopInfo.socials || SHOP_INFO.socials

  return (
    <footer className='bg-card border-t border-border'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='space-y-4'>
            <Link to='/' className='flex items-center gap-2'>
              {shopInfo.logo ? (
                <img src={shopInfo.logo} alt={shopInfo.storeName} className='w-10 h-10 object-contain' />
              ) : (
                <div className='w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center'>
                  <Scissors className='w-5 h-5 text-primary-foreground' />
                </div>
              )}
              <span className='font-display text-xl font-bold text-foreground'>{shopInfo.storeName}</span>
            </Link>
            <p className='text-muted-foreground text-sm'>
              {shopInfo.description ||
                'Nơi phong cách gặp gỡ sự tinh tế. Chúng tôi mang đến trải nghiệm cắt tóc đẳng cấp cho quý ông.'}
            </p>
            <div className='flex gap-4'>
              <a
                href={socials.facebook}
                className='text-muted-foreground hover:text-primary transition-colors'
                target='_blank'
                rel='noreferrer'
              >
                <Facebook className='w-5 h-5' />
              </a>
              <a
                href={socials.instagram}
                className='text-muted-foreground hover:text-primary transition-colors'
                target='_blank'
                rel='noreferrer'
              >
                <Instagram className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='font-display text-lg font-semibold mb-4 text-foreground'>Liên kết</h4>
            <ul className='space-y-2'>
              {NAV_LINKS.filter((link) => link.href !== '/').map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className='text-muted-foreground hover:text-primary transition-colors text-sm'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='font-display text-lg font-semibold mb-4 text-foreground'>Liên hệ</h4>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3 text-sm text-muted-foreground'>
                <MapPin className='w-4 h-4 mt-0.5 text-primary' />
                <span>{shopInfo.address}</span>
              </li>
              <li className='flex items-center gap-3 text-sm text-muted-foreground'>
                <Phone className='w-4 h-4 text-primary' />
                <span>{shopInfo.phone}</span>
              </li>
              <li className='flex items-center gap-3 text-sm text-muted-foreground'>
                <Mail className='w-4 h-4 text-primary' />
                <span>{shopInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className='font-display text-lg font-semibold mb-4 text-foreground'>Giờ mở cửa</h4>
            <ul className='space-y-2'>
              <li className='flex items-center gap-3 text-sm text-muted-foreground'>
                <Clock className='w-4 h-4 text-primary' />
                <span>{workingHours.weekdays}</span>
              </li>
              <li className='flex items-center gap-3 text-sm text-muted-foreground'>
                <Clock className='w-4 h-4 text-primary' />
                <span>{workingHours.weekend}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-border mt-8 pt-8 text-center'>
          <p className='text-muted-foreground text-sm'>
            © {new Date().getFullYear()} {shopInfo.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
