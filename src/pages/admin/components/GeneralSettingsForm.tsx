import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateSystemConfigMutation } from '@/queries/useSystemConfig'
import type { SystemConfig } from '@/types'

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
    socials: initialData.socials || { facebook: '', instagram: '' }
  })

  const updateConfigMutation = useUpdateSystemConfigMutation()

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateConfigMutation.mutate(generalSettings, {
      onSuccess: () => toast.success('Cập nhật thông tin thành công'),
      onError: () => toast.error('Cập nhật thất bại')
    })
  }

  return (
    <form onSubmit={handleGeneralSubmit} className='space-y-4'>
      <div className='grid gap-2'>
        <Label htmlFor='storeName'>Tên cửa hàng</Label>
        <Input
          id='storeName'
          value={generalSettings.storeName}
          onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='address'>Địa chỉ</Label>
        <Input
          id='address'
          value={generalSettings.address}
          onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
        />
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

      <Button variant='gold' type='submit'>
        Lưu thay đổi
      </Button>
    </form>
  )
}
