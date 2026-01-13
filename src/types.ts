import { BookingStatus, PaymentStatus } from './lib/constants'

export const GENDERS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDERS)[number]

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role?: string
  avatar?: string
  address?: string | { street?: string; city?: string; district?: string }
  gender?: Gender
  rating?: number
  experience?: number
  specialty?: string
  bio?: string
}

export interface Service {
  _id: string
  name: string
  price: number
  duration: number
  description?: string
  images?: string[]
  isActive?: boolean
  bufferTime?: number
}

export interface Review {
  _id: string
  user?: User
  barber?: User | string
  rating: number
  comment: string
  images?: string[]
  likes?: number
  createdAt?: string
  booking?: string | { service: string | Service }
}

export interface Product {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
  category: string
  rating?: number
  ratingCount?: number
  stock: number
  isActive?: boolean
}

export interface Booking {
  _id: string
  user?: User | string
  barber?: User | { _id: string; name: string }
  service?: Service | { _id: string; name: string; price: number; duration: number } // Allow populated data
  startTime: string
  endTime?: string
  status: (typeof BookingStatus)[keyof typeof BookingStatus]
  paymentStatus?: (typeof PaymentStatus)[keyof typeof PaymentStatus]
  notes?: string
  totalPrice?: number
  hasReview?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'Booking' | 'Promotion' | 'Order' | 'System' | 'Payment' | 'Review'
  isRead: boolean
  createdAt: string
  referenceId?: string
}

export interface SystemConfig {
  storeName: string
  address: string
  phone: string
  email: string
  workingHours: {
    weekdays: string
    weekend: string
  }
  socials: {
    facebook: string
    instagram: string
  }
  description?: string
  logo?: string
}

export interface Order {
  _id: string
  user: string | User
  items: {
    product: string | Product
    quantity: number
    nameAtPurchase?: string
    priceAtPurchase?: number
  }[]
  totalPrice: number
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'Cash' | 'MoMo' | 'Banking'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  shippingAddress: {
    street: string
    city: string
    district?: string
    country?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface SuccessResponse<Data> {
  message: string
  data: Data
}
