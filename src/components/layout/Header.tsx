import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Scissors, ShoppingCart, User, LogOut, Bell, LayoutDashboard, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { NAV_LINKS, UserRole } from '@/lib/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
      setIsLoggingOut(false)
    }
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 group'>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary'>
              <Scissors className='w-5 h-5 text-primary-foreground' />
            </div>
            <span className='font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors'>
              BarberShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `transition-colors font-medium ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className='hidden md:flex items-center gap-4'>
            {isAuthenticated ? (
              <>
                <Button variant='ghost' size='icon' className='relative' asChild>
                  <Link to='/cart' aria-label='Giỏ hàng'>
                    <ShoppingCart className='w-5 h-5' />
                  </Link>
                </Button>
                <Button variant='ghost' size='icon' asChild>
                  <Link to='/notifications' aria-label='Thông báo'>
                    <Bell className='w-5 h-5' />
                  </Link>
                </Button>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user?.avatar} alt={user?.name} className='object-cover' />
                        <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem asChild>
                      <Link to='/profile' className='cursor-pointer'>
                        <User className='w-4 h-4 mr-2' />
                        Tài khoản
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === UserRole.ADMIN && (
                      <DropdownMenuItem asChild>
                        <Link to='/admin' className='cursor-pointer'>
                          <LayoutDashboard className='w-4 h-4 mr-2' />
                          Quản trị
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === UserRole.BARBER && (
                      <DropdownMenuItem asChild>
                        <Link to='/barber' className='cursor-pointer'>
                          <LayoutDashboard className='w-4 h-4 mr-2' />
                          Lịch làm việc
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to='/bookings' className='cursor-pointer'>
                        <Scissors className='w-4 h-4 mr-2' />
                        Lịch đặt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to='/orders' className='cursor-pointer'>
                        <Package className='w-4 h-4 mr-2' />
                        Đơn hàng
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='cursor-pointer text-destructive'
                      disabled={isLoggingOut}
                    >
                      <LogOut className='w-4 h-4 mr-2' />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant='ghost' asChild>
                  <Link to='/login'>Đăng nhập</Link>
                </Button>
                <Button variant='gold' asChild>
                  <Link to='/register'>Đăng ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden text-foreground'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-card border-t border-border animate-slide-up'>
          <div className='container mx-auto px-4 py-4'>
            <nav className='flex flex-col gap-4'>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `transition-colors font-medium py-2 ${
                      isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className='border-t border-border pt-4 mt-2 flex flex-col gap-2'>
                {isAuthenticated ? (
                  <>
                    <Button variant='outline' className='w-full justify-start' asChild>
                      <Link to='/profile' onClick={() => setIsMenuOpen(false)}>
                        <User className='w-4 h-4 mr-2' />
                        Tài khoản
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      className='w-full justify-start text-destructive'
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className='w-4 h-4 mr-2' />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/login' onClick={() => setIsMenuOpen(false)}>
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button variant='gold' className='w-full' asChild>
                      <Link to='/register' onClick={() => setIsMenuOpen(false)}>
                        Đăng ký
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
