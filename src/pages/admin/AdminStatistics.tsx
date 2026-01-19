import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, DollarSign, Users, Calendar, Download, Loader2 } from 'lucide-react'
import { useGetDashboardStats, useExportRevenue } from '@/queries/useStatistic'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface DashboardStats {
  stats: {
    revenue: number
    bookings: number
    newCustomers: number
    growth: number
    bookingsGrowth: number
    newCustomersGrowth: number
  }
  charts: {
    revenue: { name: string; value: number }[]
    bookings: { name: string; value: number }[]
  }
  services: { name: string; value: number; color: string }[]
  topBarbers: { name: string; revenue: number; bookings: number }[]
}

const AdminStatistics = () => {
  const [period, setPeriod] = useState('month')
  const { data: statsData, isLoading } = useGetDashboardStats(period)
  const exportRevenueMutation = useExportRevenue()
  const data: DashboardStats | null = statsData?.metadata || null

  const handleExport = () => {
    exportRevenueMutation.mutate(undefined, {
      onSuccess: (response: any) => {
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `revenue-report-${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
      },
      onError: (error) => {
        console.error('Export failed:', error)
      }
    })
  }

  if (isLoading && !data) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    )
  }

  // Fallback if data is null but not loading (error case)
  if (!data) return <div>Không có dữ liệu</div>

  const statsCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(data.stats.revenue),
      change: `+${data.stats.growth}%`,
      icon: DollarSign
    },
    {
      title: 'Tổng lịch đặt',
      value: data.stats.bookings,
      change: `${data.stats.bookingsGrowth > 0 ? '+' : ''}${data.stats.bookingsGrowth}%`,
      icon: Calendar
    },
    {
      title: 'Khách hàng mới',
      value: data.stats.newCustomers,
      change: `${data.stats.newCustomersGrowth > 0 ? '+' : ''}${data.stats.newCustomersGrowth}%`,
      icon: Users
    },
    {
      title: 'Tỉ lệ tăng trưởng',
      value: `${data.stats.growth}%`,
      change: '+3%',
      icon: TrendingUp
    }
  ]

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Thống kê</h1>
          <p className='text-muted-foreground'>Xem báo cáo và phân tích doanh thu.</p>
        </div>
        <div className='flex gap-3'>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className='w-35'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='week'>7 ngày</SelectItem>
              <SelectItem value='month'>30 ngày</SelectItem>
              <SelectItem value='year'>Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' onClick={handleExport} disabled={exportRevenueMutation.isPending}>
            {exportRevenueMutation.isPending ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Download className='w-4 h-4 mr-2' />
            )}
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {statsCards.map((stat, index) => (
          <Card key={index} className='bg-card/50 border-border/50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center'>
                  <stat.icon className='w-5 h-5 text-primary' />
                </div>
                {/* <div className='flex items-center gap-1 text-sm text-green-500'>
                  <ArrowUpRight className='w-4 h-4' />
                  {stat.change}
                </div> */}
              </div>
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-sm text-muted-foreground'>{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid lg:grid-cols-2 gap-6 mb-6'>
        {/* Revenue Chart */}
        <Card className='bg-card/50 border-border/50'>
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-75'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data.charts.revenue}>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <YAxis
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey='value' fill='hsl(45, 93%, 47%)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card className='bg-card/50 border-border/50'>
          <CardHeader>
            <CardTitle>Lịch đặt theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-75'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={data.charts.bookings}>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <YAxis stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Lịch đặt']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='hsl(45, 93%, 47%)'
                    strokeWidth={3}
                    dot={{ fill: 'hsl(45, 93%, 47%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Service Distribution */}
        <Card className='bg-card/50 border-border/50'>
          <CardHeader>
            <CardTitle>Phân bổ dịch vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-75 flex items-center'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data.services} // Fix: Use data.services which has value and color
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.services.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Lượt đặt']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Barbers */}
        <Card className='bg-card/50 border-border/50'>
          <CardHeader>
            <CardTitle>Top thợ cắt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {data.topBarbers.map((barber, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary'>
                    {index + 1}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium'>{barber.name}</p>
                    <p className='text-sm text-muted-foreground'>{barber.bookings} lịch đặt</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-primary'>{formatCurrency(barber.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminStatistics
