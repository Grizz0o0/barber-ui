import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateSystemConfigMutation } from '@/queries/useSystemConfig'
import { useUploadImageMutation } from '@/queries/useMedia'
import type { SystemConfig } from '@/types'
import { Loader2, Upload, X } from 'lucide-react'

interface GeneralSettingsFormProps {
  initialData: SystemConfig
}

export function GeneralSettingsForm({ initialData }: GeneralSettingsFormProps) {
  const [generalSettings, setGeneralSettings] = useState<SystemConfig>({
    storeName: initialData.storeName || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    description: initialData.description || '',
    workingHours: initialData.workingHours || { weekdays: '', weekend: '' },
    socials: initialData.socials || { facebook: '', instagram: '' },
    logo: initialData.logo || ''
  })

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateConfigMutation = useUpdateSystemConfigMutation()
  const uploadImageMutation = useUploadImageMutation()

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    setIsUploading(true)
    uploadImageMutation.mutate(file, {
      onSuccess: (response: any) => {
        const uploadedUrl = response.metadata?.image?.files?.[0]?.url || response.data?.image?.files?.[0]?.url
        if (uploadedUrl) {
          setGeneralSettings((prev) => ({ ...prev, logo: uploadedUrl }))
          toast.success('Đã tải ảnh lên')
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

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateConfigMutation.mutate(generalSettings, {
      onSuccess: () => toast.success('Cập nhật thông tin thành công'),
      onError: () => toast.error('Cập nhật thất bại')
    })
  }

  return (
    <form onSubmit={handleGeneralSubmit} className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='storeName'>Tên cửa hàng</Label>
            <Input
              id='storeName'
              value={generalSettings.storeName}
              onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Logo</Label>
            <div className='flex items-center gap-4'>
              <div className='relative w-20 h-20 rounded-lg border border-border overflow-hidden bg-secondary/50 flex items-center justify-center'>
                {generalSettings.logo ? (
                  <img src={generalSettings.logo} alt='Logo' className='w-full h-full object-cover' />
                ) : (
                  <Upload className='w-8 h-8 text-muted-foreground' />
                )}
                {isUploading && (
                  <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                    <Loader2 className='w-6 h-6 text-white animate-spin' />
                  </div>
                )}
                {generalSettings.logo && !isUploading && (
                  <button
                    type='button'
                    onClick={() => setGeneralSettings({ ...generalSettings, logo: '' })}
                    className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors'
                  >
                    <X className='w-3 h-3' />
                  </button>
                )}
              </div>
              <div className='flex-1'>
                <input type='file' ref={fileInputRef} className='hidden' accept='image/*' onChange={handleLogoChange} />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang tải...' : 'Thay đổi Logo'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='address'>Địa chỉ</Label>
            <Input
              id='address'
              value={generalSettings.address}
              onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='phone'>Hotline</Label>
          <Input
            id='phone'
            value={generalSettings.phone}
            onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email liên hệ</Label>
          <Input
            id='email'
            type='email'
            value={generalSettings.email}
            onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='hours-weekdays'>Giờ làm việc (T2-T6)</Label>
          <Input
            id='hours-weekdays'
            value={generalSettings.workingHours?.weekdays || ''}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                workingHours: {
                  weekdays: e.target.value,
                  weekend: generalSettings.workingHours?.weekend || ''
                }
              })
            }
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='hours-weekend'>Giờ làm việc (T7-CN)</Label>
          <Input
            id='hours-weekend'
            value={generalSettings.workingHours?.weekend || ''}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                workingHours: {
                  weekdays: generalSettings.workingHours?.weekdays || '',
                  weekend: e.target.value
                }
              })
            }
          />
        </div>
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='description'>Mô tả ngắn</Label>
        <Textarea
          id='description'
          value={generalSettings.description}
          onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
        />
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='fb'>Facebook URL</Label>
          <Input
            id='fb'
            value={generalSettings.socials?.facebook || ''}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                socials: {
                  facebook: e.target.value,
                  instagram: generalSettings.socials?.instagram || ''
                }
              })
            }
            placeholder='https://facebook.com/...'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='insta'>Instagram URL</Label>
          <Input
            id='insta'
            value={generalSettings.socials?.instagram || ''}
            onChange={(e) =>
              setGeneralSettings({
                ...generalSettings,
                socials: {
                  facebook: generalSettings.socials?.facebook || '',
                  instagram: e.target.value
                }
              })
            }
            placeholder='https://instagram.com/...'
          />
        </div>
      </div>

      <Button variant='gold' type='submit' disabled={updateConfigMutation.isPending}>
        {updateConfigMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  )
}
