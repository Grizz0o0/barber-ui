import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Loader2, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useGetOrders, useUpdateOrderMutation } from '@/queries'

interface Order {
  id: string
  totalPrice: number
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  shippingAddress: {
    street: string
    city: string
    district?: string
    country?: string
  }
  items: {
    product: {
      name: string
      price: number
      image?: string
    }
    quantity: number
  }[]
  user?: {
    name: string
    email: string
  }
  createdAt: string
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending_payment: { label: 'Chờ thanh toán', color: 'text-yellow-500', icon: Clock },
  processing: { label: 'Đang xử lý', color: 'text-blue-500', icon: Loader2 },
  shipped: { label: 'Đang giao', color: 'text-purple-500', icon: Truck },
  delivered: { label: 'Đã giao', color: 'text-green-500', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'text-red-500', icon: XCircle }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const AdminOrders = () => {
  const { data: ordersData, isLoading } = useGetOrders()
  const updateOrderMutation = useUpdateOrderMutation()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Normalize data
  const orders: Order[] = (ordersData?.metadata?.orders || ordersData?.metadata || []).map((o: any) => ({
    id: o._id,
    totalPrice: o.totalPrice,
    status: o.status,
    paymentMethod: o.paymentMethod,
    shippingAddress: o.shippingAddress,
    items: o.items.map((i: any) => ({
      product: {
        name: i.product?.name || 'Sản phẩm đã xóa',
        price: i.product?.price || 0,
        image: i.product?.images?.[0] || ''
      },
      quantity: i.quantity
    })),
    user: o.user ? { name: o.user.name, email: o.user.email } : undefined,
    createdAt: o.createdAt
  }))

  const filteredOrders = orders
    .filter((o) => o.id.includes(search) || o.user?.name.toLowerCase().includes(search.toLowerCase()))
    .filter((o) => filterStatus === 'all' || o.status === filterStatus)

  const handleUpdateStatus = (newStatus: string) => {
    if (selectedOrder) {
      updateOrderMutation.mutate(
        { id: selectedOrder.id, body: { status: newStatus as any } },
        {
          onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công')
            setDetailsOpen(false)
            setSelectedOrder(null)
          },
          onError: () => {
            toast.error('Cập nhật thất bại')
          }
        }
      )
    }
  }

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý đơn hàng</h1>
          <p className='text-muted-foreground'>Theo dõi và xử lý đơn hàng.</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='relative flex-1 min-w-50 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm theo mã đơn hoặc tên khách...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-45'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            {Object.entries(statusMap).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredOrders.map((order) => {
            const StatusIcon = statusMap[order.status]?.icon || Clock
            return (
              <Card key={order.id} className='overflow-hidden hover:border-primary/50 transition-colors'>
                <CardContent className='p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <span className='font-mono font-bold text-lg'>#{order.id.slice(-6).toUpperCase()}</span>
                      <span className={`flex items-center gap-1 text-sm font-medium ${statusMap[order.status]?.color}`}>
                        <StatusIcon className='w-4 h-4' />
                        {statusMap[order.status]?.label}
                      </span>
                    </div>
                    <div className='text-sm text-muted-foreground mb-1'>
                      Khách hàng: <span className='font-medium text-foreground'>{order.user?.name || 'Vãng lai'}</span>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className='flex flex-col md:items-end gap-1'>
                    <div className='font-display font-bold text-xl text-primary'>{formatPrice(order.totalPrice)}</div>
                    <div className='text-sm text-muted-foreground'>{order.paymentMethod}</div>
                  </div>

                  <Button
                    variant='outline'
                    onClick={() => {
                      setSelectedOrder(order)
                      setDetailsOpen(true)
                    }}
                  >
                    <Eye className='w-4 h-4 mr-2' />
                    Chi tiết
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id.slice(-6).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className='py-4 space-y-6'>
              {/* Order Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Thông tin giao hàng</h4>
                  <p className='text-sm text-muted-foreground'>{selectedOrder.user?.name}</p>
                  <p className='text-sm text-muted-foreground'>{selectedOrder.user?.email}</p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.district},{' '}
                    {selectedOrder.shippingAddress.city}
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-2'>Trạng thái</h4>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(v) => handleUpdateStatus(v)}
                    disabled={updateOrderMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className='font-semibold mb-3'>Sản phẩm ({selectedOrder.items.length})</h4>
                <div className='space-y-3'>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className='flex items-center gap-4 bg-muted/50 p-3 rounded-lg'>
                      <img
                        src={item.product.image || 'https://placehold.co/100?text=Product'}
                        alt={item.product.name}
                        className='w-12 h-12 rounded object-cover'
                      />
                      <div className='flex-1'>
                        <h5 className='font-medium text-sm'>{item.product.name}</h5>
                        <p className='text-sm text-muted-foreground'>
                          {formatPrice(item.product.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className='font-medium'>{formatPrice(item.product.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                <div className='flex justify-between items-center mt-4 pt-4 border-t'>
                  <span className='font-bold'>Tổng cộng</span>
                  <span className='font-display font-bold text-xl text-primary'>
                    {formatPrice(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders
