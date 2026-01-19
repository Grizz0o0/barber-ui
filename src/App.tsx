import { Suspense, lazy } from 'react'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import PageLoader from '@/components/common/PageLoader'
import ChatWidget from '@/components/ChatWidget'

// Lazy load pages
const Index = lazy(() => import('./pages/Index'))
const Services = lazy(() => import('./pages/Services'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Booking = lazy(() => import('./pages/Booking'))
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Register = lazy(() => import('./pages/Register'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const AIStylist = lazy(() => import('./pages/AIStylist'))
const About = lazy(() => import('./pages/About'))
const Reviews = lazy(() => import('./pages/Reviews'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const LikedReviews = lazy(() => import('./pages/LikedReviews'))
const Notifications = lazy(() => import('./pages/Notifications'))

// Admin Lazy Load
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminServices = lazy(() => import('./pages/admin/AdminServices'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const AdminStatistics = lazy(() => import('./pages/admin/AdminStatistics'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminChat = lazy(() => import('./pages/admin/AdminChat'))

// Barber Lazy Load
const BarberLayout = lazy(() => import('./components/layout/BarberLayout'))
const BarberDashboard = lazy(() => import('./pages/barber/BarberDashboard'))
const BarberSchedule = lazy(() => import('./pages/barber/BarberSchedule'))
const BarberProfile = lazy(() => import('./pages/barber/BarberProfile'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Sonner position='top-center' />
          <ChatWidget />
          <BrowserRouter>
            <Suspense fallback={<PageLoader fullScreen />}>
              <Routes>
                <Route path='/' element={<Index />} />
                <Route path='/services' element={<Services />} />
                <Route path='/products' element={<Products />} />
                <Route path='/products/:id' element={<ProductDetail />} />
                <Route path='/booking' element={<Booking />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/checkout' element={<Checkout />} />
                <Route path='/booking-success/:id' element={<BookingSuccess />} />
                <Route path='/order-success/:id' element={<OrderSuccess />} />
                <Route path='/payment/success' element={<PaymentResult />} />
                <Route path='/ai-stylist' element={<AIStylist />} />
                <Route path='/login' element={<Login />} />
                <Route path='/oauth/google' element={<OAuthCallback />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/register' element={<Register />} />
                <Route path='/bookings' element={<MyBookings />} />
                <Route path='/orders' element={<MyOrders />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/verify-email' element={<VerifyEmail />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/about' element={<About />} />
                <Route path='/reviews' element={<Reviews />} />
                <Route path='/liked-reviews' element={<LikedReviews />} />

                {/* Admin Routes */}
                <Route path='/admin' element={<AdminDashboard />}>
                  <Route index element={<AdminOverview />} />
                  <Route path='bookings' element={<AdminBookings />} />
                  <Route path='services' element={<AdminServices />} />
                  <Route path='products' element={<AdminProducts />} />
                  <Route path='orders' element={<AdminOrders />} />
                  <Route path='staff' element={<AdminStaff />} />
                  <Route path='statistics' element={<AdminStatistics />} />
                  <Route path='users' element={<AdminUsers />} />
                  <Route path='settings' element={<AdminSettings />} />
                  <Route path='chat' element={<AdminChat />} />
                </Route>

                {/* Barber Routes */}
                <Route path='/barber' element={<BarberLayout />}>
                  <Route index element={<BarberDashboard />} />
                  <Route path='schedule' element={<BarberSchedule />} />
                  <Route path='profile' element={<BarberProfile />} />
                </Route>

                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
