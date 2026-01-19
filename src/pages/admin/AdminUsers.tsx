import { useState } from 'react'
import { Search, MoreHorizontal, Eye, Lock, Unlock, Trash2, Calendar, ShoppingBag, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Booking } from '@/types'
import { BookingStatus } from '@/lib/constants'
import { useGetGuestList, useUpdateUserMutation, useDeleteUserMutation } from '@/queries/useAccount'
import { useGetBookings } from '@/queries/useBooking'

// Helper for formatting price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  status: 'active' | 'locked'
  isActive: boolean
  totalBookings: number
  totalSpent: number
  createdAt: string
  lastActive: string
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)

  // React Query Hooks
  const { data: usersData, isLoading: loading } = useGetGuestList({
    page,
    limit: 50,
    select: ['name', 'email', 'phone', 'avatar', 'isActive', 'createdAt', 'updatedAt', 'role'], // Note: select array support in schema
    q: searchQuery // Assuming 'q' is supported or will be added to the schema/type
  })

  // Fetch user bookings when detail is open
  const { data: userBookingsData, isLoading: loadingBookings } = useGetBookings(
    {
      user: selectedUser?.id,
      limit: 10,
      sortBy: 'startTime',
      order: 'desc'
    },
    !!selectedUser && showDetail
  )
  const userBookings = (userBookingsData?.metadata?.bookings || []) as Booking[]

  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  const handleToggleLock = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate(
      { id: userId, body: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          toast.success(currentStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
        },
        onError: () => {
          toast.error('Không thể cập nhật trạng thái')
        }
      }
    )
  }

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('Đã xóa người dùng')
      },
      onError: () => {
        toast.error('Không thể xóa người dùng')
      }
    })
  }

  // Derived state from query data
  const userList = usersData?.data?.users || usersData?.metadata?.users || []
  const pagination = usersData?.data?.pagination || usersData?.metadata?.pagination || { totalPages: 1, totalItems: 0 }
  const totalPages = pagination.totalPages
  const totalUsers = pagination.totalItems

  const users: User[] = userList.map((u: any) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone || 'Chưa cập nhật',
    avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`,
    status: u.isActive ? 'active' : 'locked',
    isActive: u.isActive,
    totalBookings: 0,
    totalSpent: 0,
    createdAt: u.createdAt,
    lastActive: u.updatedAt || u.createdAt
  }))

  const filteredUsers = users

  const handleViewDetail = (user: User) => {
    setSelectedUser(user)
    setShowDetail(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-500/20 text-green-500 hover:bg-green-500/30'>Hoạt động</Badge>
      case 'locked':
        return <Badge className='bg-destructive/20 text-destructive hover:bg-destructive/30'>Đã khóa</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  return (
    <div className='space-y-6 p-6 lg:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý người dùng</h1>
          <p className='text-muted-foreground'>Quản lý thông tin và tài khoản khách hàng</p>
        </div>
      </div>

      {/* Search */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm theo tên, email, số điện thoại...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Stats - MOCKED or CALCULATED from visible list */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-card rounded-xl p-4 border border-border'>
          <p className='text-muted-foreground text-sm'>Tổng người dùng</p>
          <p className='text-2xl font-bold'>{totalUsers}</p>
        </div>
        <div className='bg-card rounded-xl p-4 border border-border'>
          <p className='text-muted-foreground text-sm'>Đang hoạt động</p>
          <p className='text-2xl font-bold text-green-500'>{users.filter((u) => u.isActive).length}</p>
        </div>
        <div className='bg-card rounded-xl p-4 border border-border'>
          <p className='text-muted-foreground text-sm'>Đã khóa</p>
          <p className='text-2xl font-bold text-destructive'>{users.filter((u) => !u.isActive).length}</p>
        </div>
        <div className='bg-card rounded-xl p-4 border border-border'>
          <p className='text-muted-foreground text-sm'>Tổng chi tiêu</p>
          <p className='text-2xl font-bold text-primary'>
            {formatPrice(0)} {/* Backend doesn't support aggregate stats yet */}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-card rounded-xl border border-border overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='text-center'>Lịch đặt</TableHead>
              <TableHead className='text-right'>Chi tiêu</TableHead>
              <TableHead>Hoạt động cuối</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8'>
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8'>
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <img src={user.avatar} alt={user.name} className='w-10 h-10 rounded-full object-cover' />
                      <div>
                        <p className='font-medium'>{user.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <p className='text-sm flex items-center gap-1'>
                        <Mail className='w-3 h-3' /> {user.email}
                      </p>
                      <p className='text-sm flex items-center gap-1 text-muted-foreground'>
                        <Phone className='w-3 h-3' /> {user.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className='text-center'>{user.totalBookings}</TableCell>
                  <TableCell className='text-right font-medium text-primary'>{formatPrice(user.totalSpent)}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {new Date(user.lastActive).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleViewDetail(user)}>
                          <Eye className='w-4 h-4 mr-2' />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(user.id, user.isActive)}>
                          {user.isActive ? (
                            <>
                              <Lock className='w-4 h-4 mr-2' />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className='w-4 h-4 mr-2' />
                              Mở khóa
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Trước
        </Button>
        <span className='text-sm mx-2'>
          Trang {page} / {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Sau
        </Button>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className='space-y-6'>
              {/* User Info */}
              <div className='flex items-center gap-4 p-4 bg-secondary/50 rounded-xl'>
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className='w-16 h-16 rounded-full object-cover'
                />
                <div>
                  <h3 className='text-xl font-bold'>{selectedUser.name}</h3>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                    <span className='flex items-center gap-1'>
                      <Mail className='w-4 h-4' /> {selectedUser.email}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Phone className='w-4 h-4' /> {selectedUser.phone}
                    </span>
                  </div>
                </div>
                <div className='ml-auto'>{getStatusBadge(selectedUser.status)}</div>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-card rounded-xl border border-border'>
                  <Calendar className='w-6 h-6 mx-auto mb-2 text-primary' />
                  <p className='text-2xl font-bold'>{userBookings.length}</p>
                  <p className='text-sm text-muted-foreground'>Lịch đặt</p>
                </div>
                <div className='text-center p-4 bg-card rounded-xl border border-border'>
                  <ShoppingBag className='w-6 h-6 mx-auto mb-2 text-primary' />
                  <p className='text-2xl font-bold text-primary'>
                    {formatPrice(userBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0))}
                  </p>
                  <p className='text-sm text-muted-foreground'>Tổng chi tiêu (trang này)</p>
                </div>
                <div className='text-center p-4 bg-card rounded-xl border border-border'>
                  <Calendar className='w-6 h-6 mx-auto mb-2 text-primary' />
                  <p className='text-lg font-bold'>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p className='text-sm text-muted-foreground'>Ngày tham gia</p>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h4 className='font-semibold mb-3'>Lịch sử đặt lịch gần đây</h4>
                {loadingBookings ? (
                  <p className='text-center text-muted-foreground py-4'>Đang tải lịch sử...</p>
                ) : userBookings.length === 0 ? (
                  <p className='text-muted-foreground italic'>Chưa có lịch đặt nào.</p>
                ) : (
                  <div className='space-y-2'>
                    {userBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className='flex items-center justify-between p-3 bg-card rounded-lg border border-border'
                      >
                        <div>
                          <p className='font-medium'>{booking.service?.name || 'Dịch vụ'}</p>
                          <p className='text-sm text-muted-foreground'>
                            {booking.barber?.name || 'Barber'} •{' '}
                            {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium text-primary'>{formatPrice(booking.totalPrice || 0)}</p>
                          <Badge
                            className={
                              booking.status === BookingStatus.COMPLETED
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-gray-500/20 text-gray-500'
                            }
                          >
                            {booking.status === BookingStatus.COMPLETED ? 'Hoàn thành' : booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminUsers
