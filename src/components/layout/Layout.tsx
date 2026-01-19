import { type ReactNode, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '@/contexts/AuthContext'
import { socketClient } from '@/lib/socket'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?._id) return

    const socket = socketClient.connect()

    const handleNotification = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.info(data.title || 'Thông báo mới', {
        description: data.message,
        action: {
          label: 'Xem',
          onClick: () => (window.location.href = '/notifications')
        }
      })
    }

    socket.on(`notification:${user._id}`, handleNotification)

    return () => {
      socket.off(`notification:${user._id}`, handleNotification)
    }
  }, [user, queryClient])

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />
      <main className='flex-1 pt-16 md:pt-20'>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
