import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Calendar, Loader2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GENDERS } from '@/types'
import type { Gender } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useUpdateMeMutation } from '@/queries/useAccount'
import { useUploadImageMutation } from '@/queries/useMedia'

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z
    .string()
    .regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  avatar: z.string().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

const Profile = () => {
  const { user, refetchUser } = useAuth()

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMeMutation = useUpdateMeMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: typeof user?.address === 'object' ? user?.address?.street : user?.address || '',
      district: typeof user?.address === 'object' ? user?.address?.district : '',
      city: typeof user?.address === 'object' ? user?.address?.city : '',
      gender: (user?.gender as Gender) || GENDERS[2],
      avatar: user?.avatar || ''
    }
  })

  // Watch gender for controlled Select component
  const genderValue = watch('gender')
  const avatarValue = watch('avatar')

  // Update form values when user loads
  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('phone', user.phone || '')

      if (typeof user.address === 'object' && user.address) {
        setValue('address', user.address.street || '')
        setValue('district', user.address.district || '')
        setValue('city', user.address.city || '')
      } else {
        setValue('address', (user.address as string) || '')
      }

      setValue('gender', user.gender as Gender | undefined)
      setValue('avatar', user.avatar || '')
    }
  }, [user, setValue])

  const uploadImageMutation = useUploadImageMutation()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    setIsUploading(true)
    uploadImageMutation.mutate(file, {
      onSuccess: (response: any) => {
        const uploadedUrl = response.metadata?.image?.files?.[0]?.url || response.data?.image?.files?.[0]?.url
        if (uploadedUrl) {
          setValue('avatar', uploadedUrl)
          toast.success('Đã tải ảnh lên', { description: 'Nhấn Cập nhật để lưu thay đổi' })
        } else {
          toast.error('Không lấy được URL ảnh')
        }
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
      onError: (error: any) => {
        console.error('Upload failed:', error)
        toast.error('Tải ảnh thất bại', { description: error.message })
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  const onSubmit = (data: ProfileFormData) => {
    // setIsLoading(true) now handled by mutation status
    const payload = {
      name: data.name,
      phone: data.phone || undefined,
      address: {
        street: data.address || undefined,
        district: data.district || undefined,
        city: data.city || undefined
      },
      gender: data.gender,
      avatar: data.avatar || undefined
    }

    updateMeMutation.mutate(payload, {
      onSuccess: async () => {
        await refetchUser()
        toast.success('Cập nhật thành công', {
          description: 'Thông tin của bạn đã được lưu'
        })
      },
      onError: (error) => {
        const err = error as Error
        console.error(err)
        toast.error('Cập nhật thất bại', {
          description: err.message || 'Vui lòng thử lại'
        })
      }
    })
  }

  return (
    <Layout>
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto'>
            <h1 className='font-display text-3xl font-bold mb-8'>
              Thông tin <span className='text-gradient'>cá nhân</span>
            </h1>

            <div className='bg-card border border-border rounded-xl p-8'>
              {/* Avatar */}
              <div className='flex items-center gap-6 mb-8 pb-8 border-b border-border'>
                <div className='relative group'>
                  <div className='w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all'>
                    {avatarValue || user?.avatar ? (
                      <img src={avatarValue || user?.avatar} className='w-full h-full object-cover' alt={user?.name} />
                    ) : (
                      <User className='w-10 h-10 text-primary' />
                    )}
                    {isUploading && (
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                        <Loader2 className='w-6 h-6 text-white animate-spin' />
                      </div>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors'
                    title='Đổi ảnh đại diện'
                  >
                    <Camera className='w-4 h-4' />
                  </button>
                  <input
                    type='file'
                    ref={fileInputRef}
                    className='hidden'
                    accept='image/*'
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h2 className='font-semibold text-foreground text-lg'>{user?.name || 'Người dùng'}</h2>
                  <p className='text-muted-foreground'>{user?.email || 'email@example.com'}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='flex items-center gap-2'>
                      <User className='w-4 h-4 text-primary' />
                      Họ tên
                    </Label>
                    <Input id='name' {...register('name')} className='bg-secondary border-border' />
                    {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email' className='flex items-center gap-2'>
                      <Mail className='w-4 h-4 text-primary' />
                      Email
                    </Label>
                    <Input id='email' value={user?.email || ''} disabled className='bg-secondary/50 border-border' />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-primary' />
                      Số điện thoại
                    </Label>
                    <Input
                      id='phone'
                      {...register('phone')}
                      className='bg-secondary border-border'
                      placeholder='0912345678'
                    />
                    {errors.phone && <p className='text-destructive text-sm'>{errors.phone.message}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-primary' />
                      Giới tính
                    </Label>
                    <Select value={genderValue} onValueChange={(value) => setValue('gender', value as Gender)}>
                      <SelectTrigger className='bg-secondary border-border'>
                        <SelectValue placeholder='Chọn giới tính' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Nam</SelectItem>
                        <SelectItem value='female'>Nữ</SelectItem>
                        <SelectItem value='other'>Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address' className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-primary' />
                    Địa chỉ
                  </Label>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-1'>
                      <Input
                        id='address'
                        {...register('address')}
                        className='bg-secondary border-border'
                        placeholder='Số nhà, đường'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Input
                        id='district'
                        {...register('district')}
                        className='bg-secondary border-border'
                        placeholder='Quận / Huyện'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Input
                        id='city'
                        {...register('city')}
                        className='bg-secondary border-border'
                        placeholder='Tỉnh / Thành phố'
                      />
                    </div>
                  </div>
                </div>

                <Button type='submit' variant='gold' disabled={updateMeMutation.isPending} className='w-full md:w-auto'>
                  {updateMeMutation.isPending && <Loader2 className='w-4 h-4 animate-spin' />}
                  Cập nhật thông tin
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Profile
