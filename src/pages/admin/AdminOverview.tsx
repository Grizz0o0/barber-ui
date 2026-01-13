import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetDashboardStats } from '@/queries/useStatistic'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
  completed: { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-500 bg-red-500/10' }
}

const AdminOverview = () => {
  const { data: statsData, isLoading: loading } = useGetDashboardStats('day')
  const data = statsData?.metadata

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!data) return <div>Không có dữ liệu</div>

  const stats = [
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(data.stats.revenue),
      change: `${data.stats.growth > 0 ? '+' : ''}${data.stats.growth}%`,
      trend: data.stats.growth >= 0 ? 'up' : 'down',
      icon: DollarSign
    },
    {
      title: 'Lịch đặt hôm nay',
      value: data.stats.bookings,
      change: `${data.stats.bookingsGrowth > 0 ? '+' : ''}${data.stats.bookingsGrowth}%`,
      trend: data.stats.bookingsGrowth >= 0 ? 'up' : 'down',
      icon: Calendar
    },
    {
      title: 'Khách hàng mới',
      value: data.stats.newCustomers,
      change: `${data.stats.newCustomersGrowth > 0 ? '+' : ''}${data.stats.newCustomersGrowth}%`,
      trend: data.stats.newCustomersGrowth >= 0 ? 'up' : 'down',
      icon: Users
    },
    {
      title: 'Tỉ lệ hoàn thành',
      value: '92%', // Placeholder/Hardcoded for now as backend doesn't calculate this yet
      change: '-2%',
      trend: 'down',
      icon: TrendingUp
    }
  ]

  return (
    <div className='p-6 lg:p-8'>
      <div className='mb-8'>
        <h1 className='font-display text-2xl md:text-3xl font-bold'>Tổng quan</h1>
        <p className='text-muted-foreground'>Xin chào! Đây là tình hình hoạt động hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat, index) => (
          <Card key={index} className='bg-card/50 border-border/50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                  <stat.icon className='w-5 h-5 text-primary' />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.trend === 'up' ? <ArrowUpRight className='w-4 h-4' /> : <ArrowDownRight className='w-4 h-4' />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className='text-2xl font-bold'>{stat.value}</p>
                <p className='text-sm text-muted-foreground'>{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className='bg-card/50 border-border/50'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Lịch đặt gần đây</CardTitle>
          <Link to='/admin/bookings' className='text-sm text-primary hover:underline'>
            Xem tất cả
          </Link>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            {data.recentBookings.length > 0 ? (
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Khách hàng</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Dịch vụ</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Thợ cắt</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Giờ</th>
                    <th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking: any) => {
                    const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
                    return (
                      <tr key={booking.id} className='border-b border-border/50 hover:bg-muted/50'>
                        <td className='py-3 px-2 font-medium'>{booking.customer}</td>
                        <td className='py-3 px-2 text-muted-foreground'>{booking.serviceName}</td>
                        <td className='py-3 px-2 text-muted-foreground'>{booking.barberName}</td>
                        <td className='py-3 px-2 text-muted-foreground'>{booking.time}</td>
                        <td className='py-3 px-2'>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}
                          >
                            <status.icon className='w-3 h-3' />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>Chưa có lịch đặt nào gần đây</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminOverview
