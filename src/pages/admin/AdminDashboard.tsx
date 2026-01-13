import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react'
import { UserRole } from '@/lib/constants'

const sidebarItems = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { path: '/admin/bookings', label: 'Lịch đặt', icon: Calendar },
  { path: '/admin/services', label: 'Dịch vụ', icon: Scissors },
  { path: '/admin/products', label: 'Sản phẩm', icon: Package },
  { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { path: '/admin/users', label: 'Người dùng', icon: Users },
  { path: '/admin/staff', label: 'Nhân viên', icon: Users },
  { path: '/admin/statistics', label: 'Thống kê', icon: BarChart3 },
  { path: '/admin/settings', label: 'Cài đặt', icon: Settings }
]

const AdminDashboard = () => {
  const { user, logout, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ADMIN)) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  // Prevent flash of content if user is null (though useEffect will redirect)
  if (!user || user.role !== UserRole.ADMIN) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Mobile Header */}
      <header className='lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center px-4'>
        <button onClick={() => setSidebarOpen(true)} className='p-2'>
          <Menu className='w-6 h-6' />
        </button>
        <span className='font-display text-lg font-bold ml-3'>Admin Panel</span>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className='fixed inset-0 bg-background/80 z-40 lg:hidden' onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='h-16 flex items-center justify-between px-4 border-b border-border'>
            <Link to='/admin' className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center'>
                <Scissors className='w-4 h-4 text-primary-foreground' />
              </div>
              <span className='font-display font-bold'>Admin Panel</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className='lg:hidden p-1'>
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Nav */}
          <nav className='flex-1 p-4 space-y-1'>
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${
                    isActive(item.path, item.exact)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className='w-5 h-5' />
                <span className='font-medium'>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className='p-4 border-t border-border'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center'>
                <Users className='w-5 h-5 text-primary' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>{user?.name || 'Admin'}</p>
                <p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Link to='/' className='flex-1'>
                <Button variant='outline' size='sm' className='w-full'>
                  Về trang chủ
                </Button>
              </Link>
              <Button variant='ghost' size='sm' onClick={handleLogout} className='text-destructive'>
                <LogOut className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='lg:ml-64 min-h-screen pt-16 lg:pt-0'>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminDashboard
