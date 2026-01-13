export const SHOP_INFO = {
  name: 'BarberShop',
  address: 'Số 1 Cầu Giấy, Quận Cầu Giấy, Hà Nội',
  phone: '1900 1234',
  email: 'info@barbershop.vn',
  workingHours: {
    weekdays: '9:00 - 20:00',
    weekend: '8:00 - 21:00'
  },
  socials: {
    facebook: '#',
    instagram: '#'
  }
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}p` : ''}`
  }
  return `${mins} phút`
}

export const productCategories = [
  { id: 'all', name: 'Tất cả' },
  { id: 'wax', name: 'Sáp vuốt tóc' },
  { id: 'shampoo', name: 'Dầu gội' },
  { id: 'spray', name: 'Gôm & Xịt dưỡng' },
  { id: 'gel', name: 'Gel tạo kiểu' },
  { id: 'beard', name: 'Chăm sóc râu' },
  { id: 'other', name: 'Dụng cụ & Khác' }
]

export const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30'
]

export const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/services', label: 'Dịch vụ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/booking', label: 'Đặt lịch' },
  { href: '/reviews', label: 'Đánh giá' },
  { href: '/about', label: 'Về chúng tôi' }
]

export const UserRole = {
  ADMIN: 'admin',
  BARBER: 'barber',
  CUSTOMER: 'customer'
} as const

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const

export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded'
} as const

export const PaymentMethod = {
  CASH: 'Cash',
  MOMO: 'MoMo',
  BANKING: 'Banking'
} as const
