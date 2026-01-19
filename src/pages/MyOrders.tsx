import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Package, XCircle, Truck, Loader2, RefreshCw, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/common/EmptyState'
import { useGetOrders, useUpdateOrderMutation } from '@/queries/useOrder'
import { useCreateMomoPaymentMutation } from '@/queries/usePayment'
import { formatPrice } from '@/lib/constants'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye } from 'lucide-react'

import type { Order } from '@/types'

const MyOrders = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const {
    data: ordersData,
    isLoading,
    refetch,
    isRefetching
  } = useGetOrders(
    {
      user: user?._id,
      limit: 50,
      order: 'desc',
      sortBy: 'createdAt'
    },
    !!user
  )

  const orders = (ordersData?.metadata?.orders || []) as Order[]
  const updateOrderMutation = useUpdateOrderMutation()
  const createMomoPaymentMutation = useCreateMomoPaymentMutation()

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Badge className='bg-yellow-500/20 text-yellow-500 border-yellow-500/30'>Chờ thanh toán</Badge>
      case 'processing':
        return <Badge className='bg-blue-500/20 text-blue-500 border-blue-500/30'>Đang xử lý</Badge>
      case 'shipped':
        return <Badge className='bg-purple-500/20 text-purple-500 border-purple-500/30'>Đang giao hàng</Badge>
      case 'delivered':
        return <Badge className='bg-green-500/20 text-green-500 border-green-500/30'>Đã giao hàng</Badge>
      case 'cancelled':
        return <Badge className='bg-red-500/20 text-red-500 border-red-500/30'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Filter orders based on active tab
  const filteredOrders =
    activeTab === 'all'
      ? orders
      : orders.filter((order) => {
          if (activeTab === 'pending') return order.status === 'pending_payment' || order.status === 'processing'
          return order.status === activeTab
        })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelOrder = (order: Order) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return

    updateOrderMutation.mutate(
      { id: order._id, body: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast.success('Đã hủy đơn hàng thành công')
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.message || 'Không thể hủy đơn hàng')
        }
      }
    )
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleRepay = (order: Order) => {
    setSelectedOrder(order) // Set selected order to show loading state correctly if we filter by ID
    toast.loading('Đang chuyển hướng đến MoMo...')
    createMomoPaymentMutation.mutate(
      {
        amount: order.totalPrice,
        orderId: order._id,
        orderInfo: `Thanh toan don hang #${order._id.slice(-6).toUpperCase()}`
      },
      {
        onSuccess: (paymentRes) => {
          if (paymentRes.metadata?.payUrl) {
            window.location.assign(paymentRes.metadata.payUrl)
          } else {
            toast.error('Không lấy được link thanh toán MoMo')
          }
        },
        onError: (err: any) => {
          console.error('MoMo payment failed', err)
          toast.error('Lỗi khi khởi tạo thanh toán MoMo')
        }
      }
    )
  }

  if (isLoading && !orders.length) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            {/* Header */}
            <div className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div>
                <h1 className='font-display text-3xl font-bold mb-2'>
                  Đơn hàng <span className='text-gradient'>của tôi</span>
                </h1>
                <p className='text-muted-foreground'>Quản lý và theo dõi các đơn hàng sản phẩm của bạn</p>
              </div>
              <Button variant='outline' onClick={() => refetch()} disabled={isRefetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-primary'>{orders.length}</div>
                <div className='text-sm text-muted-foreground'>Tổng đơn hàng</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-blue-500'>
                  {orders.filter((o) => o.status === 'processing' || o.status === 'pending_payment').length}
                </div>
                <div className='text-sm text-muted-foreground'>Đang xử lý</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-green-500'>
                  {orders.filter((o) => o.status === 'delivered').length}
                </div>
                <div className='text-sm text-muted-foreground'>Hoàn thành</div>
              </div>
              <div className='bg-card border border-border rounded-xl p-4 text-center'>
                <div className='text-2xl font-bold text-foreground'>
                  {formatPrice(orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalPrice : 0), 0))}
                </div>
                <div className='text-sm text-muted-foreground'>Tổng tiền đã chi</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='w-full md:w-auto bg-secondary mb-6 overflow-x-auto flex-nowrap justify-start md:justify-center'>
                <TabsTrigger value='all' className='whitespace-nowrap'>
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value='pending' className='whitespace-nowrap'>
                  Đang xử lý
                </TabsTrigger>
                <TabsTrigger value='shipped' className='whitespace-nowrap'>
                  Đang giao
                </TabsTrigger>
                <TabsTrigger value='delivered' className='whitespace-nowrap'>
                  Đã giao
                </TabsTrigger>
                <TabsTrigger value='cancelled' className='whitespace-nowrap'>
                  Đã hủy
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className='mt-0 space-y-4'>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className='bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all'
                    >
                      <div className='flex flex-col md:flex-row gap-6'>
                        {/* Order Info Header (Mobile) */}
                        <div className='flex items-center justify-between md:hidden mb-2'>
                          <span className='font-mono text-sm text-muted-foreground'>
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Items Preview */}
                        <div className='flex-1 space-y-4'>
                          {/* Order Header (Desktop) */}
                          <div className='hidden md:flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <span className='font-mono font-medium'>#{order._id.slice(-6).toUpperCase()}</span>
                              <span className='text-sm text-muted-foreground border-l pl-3 border-border'>
                                {formatDate(order.createdAt || '')}
                              </span>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className='space-y-3'>
                            {order.items.map((item, index) => (
                              <div key={index} className='flex items-center gap-4 bg-secondary/20 p-2 rounded-lg'>
                                <div className='w-12 h-12 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden'>
                                  {typeof item.product === 'object' && item.product.images?.[0] ? (
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <Package className='w-6 h-6 text-muted-foreground' />
                                  )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <p className='font-medium text-sm truncate'>
                                    {typeof item.product === 'object' ? item.product.name : 'Sản phẩm'}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>x{item.quantity}</p>
                                </div>
                                <div className='text-sm font-semibold'>
                                  {/* Note: item price comes from populate or stored? Assuming backend returns processed items */}
                                  {/* Using a rough calculation or if stored in item. Using order structure from backend */}
                                  {/* If backend doesn't populate item price, fallback */}
                                  {/* Ideally order.items stores priceAtPurchase. Let's assume for now */}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Actions & Summary */}
                        <div className='md:w-64 md:border-l md:border-border md:pl-6 flex flex-col justify-between'>
                          <div className='space-y-2 mb-4 md:mb-0'>
                            <div className='flex justify-between text-sm'>
                              <span className='text-muted-foreground'>Tổng tiền</span>
                              <span className='font-bold text-primary text-lg'>{formatPrice(order.totalPrice)}</span>
                            </div>
                            <div className='flex justify-between text-xs text-muted-foreground'>
                              <span>Thanh toán</span>
                              <span className='font-medium text-foreground'>{order.paymentMethod}</span>
                            </div>
                          </div>

                          <div className='flex flex-col gap-2 mt-4'>
                            <Button variant='outline' size='sm' onClick={() => handleViewDetails(order)}>
                              <Eye className='w-4 h-4 mr-2' />
                              Xem chi tiết
                            </Button>

                            {/* Allow cancel if pending payment or processing */}
                            {(order.status === 'pending_payment' || order.status === 'processing') && (
                              <Button
                                variant='destructive'
                                size='sm'
                                className='bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
                                onClick={() => handleCancelOrder(order)}
                                disabled={updateOrderMutation.isPending}
                              >
                                <XCircle className='w-4 h-4 mr-2' />
                                Hủy đơn
                              </Button>
                            )}

                            {/* Show Pay Now if pending payment */}
                            {order.status === 'pending_payment' && order.paymentMethod === 'MoMo' && (
                              <Button
                                variant='default'
                                size='sm'
                                className='bg-pink-600 hover:bg-pink-700'
                                onClick={() => handleRepay(order)}
                                disabled={createMomoPaymentMutation.isPending}
                              >
                                {createMomoPaymentMutation.isPending && selectedOrder?._id === order._id ? (
                                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                ) : null}
                                Thanh toán ngay
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={ShoppingBag}
                    title='Chưa có đơn hàng'
                    description='Bạn chưa có đơn hàng nào trong danh sách này.'
                    action={
                      <Link to='/products'>
                        <Button variant='gold'>Mua sắm ngay</Button>
                      </Link>
                    }
                  />
                )}
              </TabsContent>
            </Tabs>

            {/* Order Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
                <DialogHeader>
                  <DialogTitle>Chi tiết đơn hàng #{selectedOrder?._id.slice(-6).toUpperCase()}</DialogTitle>
                </DialogHeader>
                {selectedOrder && (
                  <ScrollArea className='flex-1 pr-4'>
                    <div className='space-y-6 py-4'>
                      {/* Order Status */}
                      <div className='flex items-center justify-between p-4 bg-secondary/30 rounded-lg'>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>Trạng thái đơn hàng</p>
                          <div className='flex items-center gap-2'>
                            {getStatusBadge(selectedOrder.status)}
                            <span className='text-sm text-muted-foreground'>
                              - {formatDate(selectedOrder.createdAt || '')}
                            </span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm text-muted-foreground'>Trạng thái thanh toán</p>
                          <Badge
                            variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'outline'}
                            className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Badge>
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h3 className='font-semibold mb-3 flex items-center gap-2'>
                          <Package className='w-4 h-4 text-primary' />
                          Sản phẩm ({selectedOrder.items.length})
                        </h3>
                        <div className='space-y-3'>
                          {selectedOrder.items.map((item, idx) => (
                            <div
                              key={idx}
                              className='flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0'
                            >
                              <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 rounded bg-secondary flex items-center justify-center overflow-hidden'>
                                  {typeof item.product === 'object' && item.product.images?.[0] ? (
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <Package className='w-6 h-6 text-muted-foreground' />
                                  )}
                                </div>
                                <div>
                                  <p className='font-medium text-sm'>
                                    {typeof item.product === 'object' ? item.product.name : 'Sản phẩm'}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>Số lượng: {item.quantity}</p>
                                </div>
                              </div>
                              <div className='text-sm font-medium'>
                                {/* Price calculation if needed, or placeholder */}
                                {formatPrice(
                                  (item.priceAtPurchase ??
                                    (typeof item.product === 'object' ? item.product.price : 0)) * item.quantity
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className='grid md:grid-cols-2 gap-6'>
                        <div>
                          <h3 className='font-semibold mb-3 flex items-center gap-2'>
                            <Truck className='w-4 h-4 text-primary' />
                            Thông tin giao hàng
                          </h3>
                          <div className='bg-secondary/20 p-4 rounded-lg text-sm space-y-2'>
                            <p>
                              <span className='text-muted-foreground'>Người nhận:</span>{' '}
                              {typeof selectedOrder.user === 'object' ? selectedOrder.user.name : '...'}
                            </p>
                            <p>
                              <span className='text-muted-foreground'>SĐT:</span>{' '}
                              {typeof selectedOrder.user === 'object' ? selectedOrder.user.phone : '...'}
                            </p>
                            <p>
                              <span className='text-muted-foreground'>Địa chỉ:</span>{' '}
                              {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.district},{' '}
                              {selectedOrder.shippingAddress.city}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className='font-semibold mb-3 flex items-center gap-2'>
                            <ShoppingBag className='w-4 h-4 text-primary' />
                            Tổng quan thanh toán
                          </h3>
                          <div className='bg-secondary/20 p-4 rounded-lg text-sm space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-muted-foreground'>Tạm tính:</span>
                              <span>{formatPrice(selectedOrder.totalPrice)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-muted-foreground'>Phí vận chuyển:</span>
                              <span>Miễn phí</span>
                            </div>
                            <div className='flex justify-between font-bold text-lg pt-2 border-t border-border/50 mt-2'>
                              <span>Tổng cộng:</span>
                              <span className='text-primary'>{formatPrice(selectedOrder.totalPrice)}</span>
                            </div>
                            <div className='flex justify-between text-xs pt-1'>
                              <span className='text-muted-foreground'>Phương thức:</span>
                              <span className='font-medium'>{selectedOrder.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
                <DialogFooter>
                  {(selectedOrder?.status === 'pending_payment' || selectedOrder?.status === 'processing') && (
                    <Button
                      variant='destructive'
                      onClick={() => {
                        setIsDetailsOpen(false)
                        if (selectedOrder) handleCancelOrder(selectedOrder)
                      }}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                  <Button variant='outline' onClick={() => setIsDetailsOpen(false)}>
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default MyOrders
