import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Clock, DollarSign, Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/common/ImageUpload'
import { useGetServices, useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation } from '@/queries'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  image: string
  bufferTime: number
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const formatDuration = (minutes: number) => {
  return `${minutes} phút`
}

const AdminServices = () => {
  const { data: servicesData, isLoading: loading } = useGetServices()
  const createServiceMutation = useCreateServiceMutation()
  const updateServiceMutation = useUpdateServiceMutation()
  const deleteServiceMutation = useDeleteServiceMutation()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    image: '',
    bufferTime: '0'
  })

  // Normalize data from API
  const services: Service[] = (servicesData?.metadata?.services || servicesData?.metadata || []).map((s: any) => ({
    id: s._id,
    name: s.name,
    description: s.description || '',
    duration: s.duration,
    price: s.price,
    image: s.images && s.images.length > 0 ? s.images[0] : '',
    bufferTime: s.bufferTime || 0
  }))

  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const resetForm = () => {
    setFormData({ name: '', description: '', duration: '', price: '', image: '', bufferTime: '0' })
    setEditingService(null)
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration.toString(),
        price: service.price.toString(),
        image: service.image,
        bufferTime: (service.bufferTime || 0).toString()
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      duration: parseInt(formData.duration),
      price: parseInt(formData.price),
      images: formData.image ? [formData.image] : [], // Backend expects array of strings
      bufferTime: parseInt(formData.bufferTime)
    }

    if (editingService) {
      updateServiceMutation.mutate(
        { id: editingService.id, body: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật dịch vụ thành công')
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
      createServiceMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Thêm dịch vụ thành công')
          setDialogOpen(false)
          resetForm()
        },
        onError: (error: any) => {
          console.error(error)
          toast.error(error.message || 'Thêm mới thất bại')
        }
      })
    }
  }

  const handleDelete = () => {
    if (deletingService) {
      deleteServiceMutation.mutate(deletingService.id, {
        onSuccess: () => {
          toast.success('Xóa dịch vụ thành công')
          setDeleteDialogOpen(false)
          setDeletingService(null)
        },
        onError: (error: any) => {
          console.error(error)
          toast.error('Xóa thất bại')
        }
      })
    }
  }

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý dịch vụ</h1>
          <p className='text-muted-foreground'>Thêm, sửa, xóa các dịch vụ cắt tóc.</p>
        </div>
        <Button variant='gold' onClick={() => handleOpenDialog()}>
          <Plus className='w-4 h-4 mr-2' />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Search */}
      <div className='relative max-w-md mb-6'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Tìm kiếm dịch vụ...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredServices.map((service) => (
            <Card key={service.id} className='bg-card/50 border-border/50 overflow-hidden group'>
              <div className='aspect-video relative overflow-hidden'>
                <img
                  src={service.image || 'https://placehold.co/400x300?text=No+Image'}
                  alt={service.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                />
              </div>
              <CardContent className='p-4'>
                <h3 className='font-display font-semibold mb-2'>{service.name}</h3>
                <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>{service.description}</p>
                <div className='flex items-center gap-4 text-sm text-muted-foreground mb-4'>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' />
                    {formatDuration(service.duration)}
                  </span>
                  <span className='flex items-center gap-1 text-primary font-medium'>
                    <DollarSign className='w-4 h-4' />
                    {formatPrice(service.price)}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' className='flex-1' onClick={() => handleOpenDialog(service)}>
                    <Pencil className='w-4 h-4 mr-1' />
                    Sửa
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => {
                      setDeletingService(service)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label>Tên dịch vụ *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='VD: Combo 7 bước'
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Mô tả chi tiết dịch vụ...'
                rows={3}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Thời gian (phút) *</Label>
                <Input
                  type='number'
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder='30'
                />
              </div>
              <div>
                <Label>Giá (VNĐ) *</Label>
                <Input
                  type='number'
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder='100000'
                />
              </div>
            </div>
            <div>
              <Label>Thời gian đệm (phút)</Label>
              <Input
                type='number'
                value={formData.bufferTime}
                onChange={(e) => setFormData({ ...formData, bufferTime: e.target.value })}
                placeholder='0 - Thời gian nghỉ sau dịch vụ'
                min={0}
              />
            </div>
            <div>
              <Label>Hình ảnh</Label>
              <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='gold' onClick={handleSubmit}>
              {editingService ? 'Cập nhật' : 'Thêm mới'}
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
            Bạn có chắc chắn muốn xóa dịch vụ "{deletingService?.name}"? Hành động này không thể hoàn tác.
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

export default AdminServices
