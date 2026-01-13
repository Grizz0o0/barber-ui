import { useState, useMemo } from 'react'
import { Bell, Check, Trash2, Calendar, ShoppingBag, Gift, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/layout/Layout'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  useGetNotifications,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '@/queries/useNotification'
import { toast } from 'sonner'
import SEO from '@/components/common/SEO'
import PageLoader from '@/components/common/PageLoader'
import { EmptyState } from '@/components/common/EmptyState'
import type { Notification } from '@/types'

const Notifications = () => {
  const { data: notificationsData, isLoading: isLoadingNotifications, refetch } = useGetNotifications()
  const markAsReadMutation = useMarkNotificationAsReadMutation()
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Process data from hook
  const notifications = useMemo(() => {
    const resCtx = notificationsData
    if (!resCtx) return []
    if (Array.isArray(resCtx)) return resCtx
    if (resCtx.data && Array.isArray(resCtx.data)) return resCtx.data
    if (resCtx.metadata) {
      if (Array.isArray(resCtx.metadata.notifications)) return resCtx.metadata.notifications
      if (Array.isArray(resCtx.metadata)) return resCtx.metadata
    }
    return []
  }, [notificationsData])

  const isLoading = isLoadingNotifications

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id, {
      onError: () => toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
    })
  }

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả là đã đọc'),
      onError: () => toast.error('Có lỗi xảy ra')
    })
  }

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id, {
      onSuccess: () => toast.success('Đã xóa thông báo'),
      onError: () => toast.error('Không thể xóa thông báo')
    })
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking':
        return <Calendar className='w-5 h-5' />
      case 'order':
        return <ShoppingBag className='w-5 h-5' />
      case 'promotion':
        return <Gift className='w-5 h-5' />
      case 'reminder':
        return <Clock className='w-5 h-5' />
      default:
        return <Bell className='w-5 h-5' />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking':
        return 'bg-blue-500/20 text-blue-400'
      case 'order':
        return 'bg-green-500/20 text-green-400'
      case 'promotion':
        return 'bg-primary/20 text-primary'
      case 'reminder':
        return 'bg-orange-500/20 text-orange-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') return !notification.isRead
    return true
  })

  return (
    <Layout>
      <SEO title='Thông báo' description='Thông báo của bạn' />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-3xl font-bold'>Thông báo</h1>
            <p className='text-muted-foreground mt-1'>Bạn có {unreadCount} thông báo chưa đọc</p>
          </div>
          <div className='flex gap-2 w-full md:w-auto'>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                onClick={() => markAllAsRead()}
                disabled={markAllAsReadMutation.isPending}
                className='flex-1 md:flex-none'
              >
                <Check className='w-4 h-4 mr-2' />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>

        <Tabs
          defaultValue='all'
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'unread')}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2 mb-8'>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
            <TabsTrigger value='unread'>
              Chưa đọc
              {unreadCount > 0 && (
                <Badge variant='secondary' className='ml-2 text-xs h-5 px-1.5 min-w-5'>
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <PageLoader />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title='Không có thông báo'
              description={filter === 'unread' ? 'Bạn đã đọc hết tất cả thông báo' : 'Bạn chưa có thông báo nào'}
            />
          ) : (
            <div className='space-y-4'>
              {filteredNotifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`bg-card border rounded-xl p-5 transition-all hover:border-primary/30 ${
                    notification.isRead ? 'border-border opacity-70' : 'border-primary/20 shadow-gold/10'
                  }`}
                >
                  <div className='flex gap-4'>
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <h3
                            className={`font-semibold ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}
                          >
                            {notification.title}
                          </h3>
                          <p className='text-muted-foreground text-sm mt-1 leading-relaxed'>{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant='default' className='bg-primary text-primary-foreground shrink-0'>
                            Mới
                          </Badge>
                        )}
                      </div>

                      <div className='flex items-center justify-between mt-4'>
                        <span className='text-xs text-muted-foreground capitalize'>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi
                          })}
                        </span>
                        <div className='flex gap-2'>
                          {!notification.isRead && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => markAsRead(notification._id)}
                              className='text-xs h-8'
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteNotification(notification._id)}
                            className='text-xs h-8 text-destructive hover:text-destructive'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </Layout>
  )
}

export default Notifications
