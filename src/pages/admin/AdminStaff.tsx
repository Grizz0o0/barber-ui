import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Plus, Pencil, Trash2, Search, Star, Scissors, Calendar, Loader2, AlertTriangle } from 'lucide-react'
import EmergencyDialog from './components/EmergencyDialog'
import ViewScheduleDialog from './components/ViewScheduleDialog'
import {
  useGetBarbers,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} from '@/queries/useAccount'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '@/types'

// Schema validation
const barberFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  experience: z.coerce.number().min(0, 'Kinh nghiệm phải là số dương'),
  specialty: z.string().min(2, 'Vui lòng nhập chuyên môn'),
  bio: z.string().optional(),
  avatar: z.string().optional()
})

type BarberFormData = z.infer<typeof barberFormSchema>

interface Barber extends User {
  totalBookings?: number
}

const AdminStaff = () => {
  const { data: barbersData, isLoading: loading } = useGetBarbers()
  const barbers = (barbersData?.metadata || []) as Barber[]

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [deletingBarber, setDeletingBarber] = useState<Barber | null>(null)
  const [emergencyBarber, setEmergencyBarber] = useState<Barber | null>(null)
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false)

  const [viewScheduleOpen, setViewScheduleOpen] = useState(false)
  const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState<Barber | null>(null)

  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  // Form setup
  const form = useForm<BarberFormData>({
    resolver: zodResolver(barberFormSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      experience: 0,
      specialty: '',
      bio: '',
      avatar: ''
    }
  })

  // Filter logic
  const filteredBarbers = barbers.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) || b.specialty?.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber)
      form.reset({
        name: barber.name,
        email: barber.email, // Email might be read-only in edit but useful to show
        experience: barber.experience || 0,
        specialty: barber.specialty || '',
        bio: barber.bio || '',
        avatar: barber.avatar || ''
      })
    } else {
      setEditingBarber(null)
      form.reset({
        name: '',
        email: '',
        experience: 0,
        specialty: '',
        bio: '',
        avatar: ''
      })
    }
    setDialogOpen(true)
  }

  const onSubmit: SubmitHandler<BarberFormData> = (data) => {
    const payload: any = {
      ...data,
      role: 'barber'
    }

    if (editingBarber) {
      // Exclude email from update if needed, or backend handles it
      updateUserMutation.mutate(
        { id: editingBarber._id, body: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật thông tin thành công')
            setDialogOpen(false)
          },
          onError: (error: any) => {
            toast.error(error.message || 'Có lỗi xảy ra')
          }
        }
      )
    } else {
      createUserMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Thêm nhân viên thành công')
          setDialogOpen(false)
        },
        onError: (error: any) => {
          toast.error(error.message || 'Có lỗi xảy ra')
        }
      })
    }
  }

  const handleDelete = () => {
    if (deletingBarber) {
      deleteUserMutation.mutate(deletingBarber._id, {
        onSuccess: () => {
          toast.success('Xóa nhân viên thành công')
          setDeleteDialogOpen(false)
          setDeletingBarber(null)
        },
        onError: (error: any) => {
          toast.error('Xóa nhân viên thất bại')
        }
      })
    }
  }

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending

  return (
    <div className='p-6 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
        <div>
          <h1 className='font-display text-2xl md:text-3xl font-bold'>Quản lý nhân viên</h1>
          <p className='text-muted-foreground'>Quản lý đội ngũ thợ cắt tóc.</p>
        </div>
        <Button variant='gold' onClick={() => handleOpenDialog()}>
          <Plus className='w-4 h-4 mr-2' />
          Thêm nhân viên
        </Button>
      </div>

      {/* Search */}
      <div className='relative max-w-md mb-6'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Tìm kiếm theo tên, chuyên môn...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredBarbers.map((barber) => (
            <Card key={barber._id} className='bg-card/50 border-border/50 overflow-hidden'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4 mb-4'>
                  <img
                    src={barber.avatar || 'https://github.com/shadcn.png'}
                    alt={barber.name}
                    className='w-16 h-16 rounded-full object-cover'
                  />
                  <div className='flex-1'>
                    <h3 className='font-display font-semibold text-lg'>{barber.name}</h3>
                    <p className='text-sm text-primary'>{barber.specialty}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Star className='w-4 h-4 fill-primary text-primary' />
                      <span className='text-sm'>{barber.rating || 0}</span>
                    </div>
                  </div>
                </div>

                <p className='text-sm text-muted-foreground mb-4 line-clamp-2'>{barber.bio}</p>

                <div className='flex flex-wrap items-center gap-4 mb-4 text-sm'>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Calendar className='w-4 h-4 shrink-0' />
                    <span className='whitespace-nowrap'> {barber.experience || 0} năm kinh nghiệm</span>
                  </div>

                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Scissors className='w-4 h-4 shrink-0' />
                    <span className='whitespace-nowrap'>{barber.totalBookings || 0} lượt đặt</span>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => {
                      setSelectedBarberForSchedule(barber)
                      setViewScheduleOpen(true)
                    }}
                  >
                    <Calendar className='w-4 h-4 mr-1' />
                    Lịch
                  </Button>
                  <Button variant='outline' size='sm' className='flex-1' onClick={() => handleOpenDialog(barber)}>
                    <Pencil className='w-4 h-4 mr-1' />
                    Sửa
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => {
                      setEmergencyBarber(barber)
                      setEmergencyDialogOpen(true)
                    }}
                    title='Báo nghỉ đột xuất'
                  >
                    <AlertTriangle className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => {
                      setDeletingBarber(barber)
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
            <DialogTitle>{editingBarber ? 'Chỉnh sửa thông tin' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
            <div>
              <Label>Email {!editingBarber && '*'}</Label>
              <Input {...form.register('email')} placeholder='nguyenvana@example.com' disabled={!!editingBarber} />
              {form.formState.errors.email && (
                <p className='text-destructive text-sm mt-1'>{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label>Họ và tên *</Label>
              <Input {...form.register('name')} placeholder='VD: Nguyễn Văn A' />
              {form.formState.errors.name && (
                <p className='text-destructive text-sm mt-1'>{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Số năm kinh nghiệm *</Label>
              <Input type='number' {...form.register('experience')} placeholder='3' />
              {form.formState.errors.experience && (
                <p className='text-destructive text-sm mt-1'>{form.formState.errors.experience.message}</p>
              )}
            </div>

            <div>
              <Label>Chuyên môn *</Label>
              <Input {...form.register('specialty')} placeholder='VD: Fade, Undercut, Hàn Quốc' />
              {form.formState.errors.specialty && (
                <p className='text-destructive text-sm mt-1'>{form.formState.errors.specialty.message}</p>
              )}
            </div>

            <div>
              <Label>Giới thiệu</Label>
              <Textarea {...form.register('bio')} placeholder='Giới thiệu ngắn về nhân viên...' rows={3} />
            </div>

            <div>
              <Label className='mb-2 block'>Ảnh đại diện</Label>
              <ImageUpload value={form.watch('avatar')} onChange={(url) => form.setValue('avatar', url)} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant='ghost' type='button'>
                  Hủy
                </Button>
              </DialogClose>
              <Button variant='gold' type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                {editingBarber ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground'>
            Bạn có chắc chắn muốn xóa nhân viên "{deletingBarber?.name}"? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Hủy</Button>
            </DialogClose>
            <Button variant='destructive' onClick={handleDelete} disabled={deleteUserMutation.isPending}>
              {deleteUserMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmergencyDialog
        open={emergencyDialogOpen}
        onOpenChange={setEmergencyDialogOpen}
        barber={emergencyBarber}
        onSuccess={() => toast.info('Đã cập nhật trạng thái lịch nghỉ')}
      />

      <ViewScheduleDialog
        open={viewScheduleOpen}
        onOpenChange={setViewScheduleOpen}
        barberId={selectedBarberForSchedule?._id || null}
        barberName={selectedBarberForSchedule?.name || ''}
      />
    </div>
  )
}

export default AdminStaff
