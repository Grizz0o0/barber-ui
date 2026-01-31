import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Loader2, Percent, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react'
import {
  useGetPromotions,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation
} from '@/queries/usePromotion'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/constants'
import type { CreatePromotionReqBody } from '@/lib/schemas/promotion.schema'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Promotion {
  _id: string
  code: string
  discountPercent?: number
  discountValue?: number
  maxDiscountValue?: number
  minOrderValue: number
  expiryDate: string
  maxUsage?: number
  usedCount: number
  applicableTo: 'product' | 'service' | 'all'
  isActive: boolean
}

const AdminPromotions = () => {
  const { data: promotionsData, isLoading: loading } = useGetPromotions()
  const createPromotionMutation = useCreatePromotionMutation()
  const updatePromotionMutation = useUpdatePromotionMutation()
  const deletePromotionMutation = useDeletePromotionMutation()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null)

  const [formData, setFormData] = useState<Partial<CreatePromotionReqBody>>({
    code: '',
    discountPercent: 0,
    discountValue: 0,
    maxDiscountValue: 0,
    minOrderValue: 0,
    expiryDate: '',
    maxUsage: 0,
    applicableTo: 'all',
    isActive: true
  })

  // Normalize data from API
  const promotions: Promotion[] = promotionsData?.metadata?.promotions || promotionsData?.metadata || []

  const filteredPromotions = promotions.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()))

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercent: 0,
      discountValue: 0,
      maxDiscountValue: 0,
      minOrderValue: 0,
      expiryDate: '',
      maxUsage: 0,
      applicableTo: 'all',
      isActive: true
    })
    setEditingPromotion(null)
  }

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        discountValue: promotion.discountValue,
        maxDiscountValue: promotion.maxDiscountValue,
        minOrderValue: promotion.minOrderValue,
        expiryDate: promotion.expiryDate,
        maxUsage: promotion.maxUsage || 0, // Display 0 if undefined/null
        applicableTo: promotion.applicableTo,
        isActive: promotion.isActive
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.code || !formData.expiryDate) {
      toast.error('Vui lòng điền mã và ngày hết hạn')
      return
    }

    // Logic: Nếu maxUsage là 0 thì gửi undefined (để backend hiểu là không giới hạn)
    const payload: any = {
      ...formData,
      maxUsage: formData.maxUsage === 0 ? undefined : formData.maxUsage,
      expiryDate: new Date(formData.expiryDate).toISOString()
    }

    if (editingPromotion) {
      updatePromotionMutation.mutate(
        { id: editingPromotion._id, body: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật khuyến mãi thành công')
            setDialogOpen(false)
            resetForm()
          },
          onError: (error: any) => {
            console.error(error)
            toast.error(error.message || 'Cập nhật thất bại')
          }
        }
      )
    } else {
      createPromotionMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Thêm khuyến mãi thành công')
          setDialogOpen(false)
          resetForm()
        },
        onError: (error: any) => {
          console.error(error)
          toast.error(error.message || 'Thêm khuyến mãi thất bại')
        }
      })
    }
  }

  const handleDelete = () => {
    if (deletingPromotion) {
      deletePromotionMutation.mutate(deletingPromotion._id, {
        onSuccess: () => {
          toast.success('Xóa khuyến mãi thành công')
          setDeleteDialogOpen(false)
          setDeletingPromotion(null)
        },
        onError: (error: any) => {
          console.error(error)
          toast.error('Xóa thất bại')
        }
      })
    }
  }

  // Handle Date Selection from Calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Pick date, default time is 23:59
      const newDate = new Date(date)
      newDate.setHours(23, 59, 59, 999)
      setFormData({ ...formData, expiryDate: newDate.toISOString() })
    }
  }

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý khuyến mãi</h1>
          <p className='text-muted-foreground'>Thêm, sửa, xóa mã giảm giá.</p>
        </div>
        <Button variant='gold' onClick={() => handleOpenDialog()}>
          <Plus className='w-4 h-4 mr-2' />
          Thêm mã mới
        </Button>
      </div>

      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='relative flex-1 min-w-50 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm mã...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      <Card className='bg-card/50 border-border/50'>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Mã</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Giảm giá</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Điều kiện</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Hạn dùng</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Lượt dùng</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Trạng thái</th>
                    <th className='text-left py-4 px-4 text-sm font-medium text-muted-foreground'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.map((p) => (
                    <tr key={p._id} className='border-b border-border/50 hover:bg-muted/50'>
                      <td className='py-4 px-4 font-medium'>{p.code}</td>
                      <td className='py-4 px-4'>
                        {p.discountPercent ? `${p.discountPercent}%` : formatPrice(p.discountValue || 0)}
                        {p.maxDiscountValue ? ` (Tối đa ${formatPrice(p.maxDiscountValue)})` : ''}
                      </td>
                      <td className='py-4 px-4 text-sm text-muted-foreground'>
                        Đơn tối thiểu: {formatPrice(p.minOrderValue)}
                        <br />
                        Áp dụng:{' '}
                        {p.applicableTo === 'all' ? 'Tất cả' : p.applicableTo === 'service' ? 'Dịch vụ' : 'Sản phẩm'}
                      </td>
                      <td className='py-4 px-4 text-sm'>
                        {new Date(p.expiryDate).toLocaleDateString('vi-VN')}
                        <br />
                        {new Date(p.expiryDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className='py-4 px-4 text-sm'>
                        {p.usedCount} / {p.maxUsage || '∞'}
                      </td>
                      <td className='py-4 px-4'>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                        >
                          {p.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className='py-4 px-4'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleOpenDialog(p)}>
                              <Pencil className='w-4 h-4 mr-2' />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingPromotion(p)
                                setDeleteDialogOpen(true)
                              }}
                              className='text-destructive focus:text-destructive'
                            >
                              <Trash2 className='w-4 h-4 mr-2' />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredPromotions.length === 0 && (
                    <tr>
                      <td colSpan={7} className='py-8 text-center text-muted-foreground'>
                        Không tìm thấy khuyến mãi nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm mã khuyến mãi'}</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto'>
            <div className='col-span-1 md:col-span-2'>
              <Label>Mã khuyến mãi *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder='SUMMER2026'
              />
            </div>

            <div>
              <Label>Loại giảm giá</Label>
              <div className='flex items-center space-x-2 mt-2'>
                {/* Simplification: Just inputs, let user decide which filled */}
              </div>
            </div>
            <div className='col-span-1 md:col-span-2 grid grid-cols-2 gap-4'>
              <div>
                <Label>Giảm theo %</Label>
                <div className='relative'>
                  <Input
                    type='number'
                    min='0'
                    max='100'
                    value={formData.discountPercent || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercent: Number(e.target.value), discountValue: 0 })
                    }
                    placeholder='0'
                  />
                  <Percent className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                </div>
              </div>
              <div>
                <Label>Giảm theo tiền (VNĐ)</Label>
                <Input
                  type='number'
                  min='0'
                  value={formData.discountValue || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value), discountPercent: 0 })
                  }
                  placeholder='0'
                />
              </div>
            </div>

            <div>
              <Label>Giảm tối đa (VNĐ)</Label>
              <Input
                type='number'
                min='0'
                value={formData.maxDiscountValue || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountValue: Number(e.target.value) })}
                placeholder='0'
              />
              <p className='text-xs text-muted-foreground mt-1'>Chỉ áp dụng khi giảm theo %</p>
            </div>

            <div>
              <Label>Đơn tối thiểu (VNĐ)</Label>
              <Input
                type='number'
                min='0'
                value={formData.minOrderValue || ''}
                onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                placeholder='0'
              />
            </div>

            <div className='col-span-1 md:col-span-2'>
              <Label>Ngày hết hạn *</Label>
              <div className='mt-1'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.expiryDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.expiryDate ? (
                        format(new Date(formData.expiryDate), 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={formData.expiryDate ? new Date(formData.expiryDate) : undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Lượt dùng tối đa</Label>
              <Input
                type='number'
                min='0'
                value={formData.maxUsage || ''}
                onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
                placeholder='0 (Không giới hạn)'
              />
            </div>

            <div>
              <Label>Áp dụng cho</Label>
              <Select
                value={formData.applicableTo}
                onValueChange={(v: any) => setFormData({ ...formData, applicableTo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value='product'>Sản phẩm</SelectItem>
                  <SelectItem value='service'>Dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onValueChange={(v) => setFormData({ ...formData, isActive: v === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Hoạt động</SelectItem>
                  <SelectItem value='false'>Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='gold' onClick={handleSubmit}>
              {editingPromotion ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground'>
            Bạn có chắc chắn muốn xóa mã "{deletingPromotion?.code}"? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='destructive' onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPromotions
