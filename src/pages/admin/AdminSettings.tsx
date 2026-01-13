import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetSystemConfig } from '@/queries/useSystemConfig'
import { useChangePasswordMutation } from '@/queries/useAuth'
import { GeneralSettingsForm } from './components/GeneralSettingsForm'

const AdminSettings = () => {
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const { data: configData, isLoading: loadingConfig } = useGetSystemConfig()
  const changePasswordMutation = useChangePasswordMutation()

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    changePasswordMutation.mutate(
      {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      },
      {
        onSuccess: () => {
          toast.success('Đổi mật khẩu thành công')
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        },
        onError: (error: any) => {
          toast.error(error.message || 'Đổi mật khẩu thất bại')
        }
      }
    )
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      <div>
        <h1 className='text-3xl font-display font-bold'>Cài đặt</h1>
        <p className='text-muted-foreground'>Quản lý thông tin cửa hàng và tài khoản.</p>
      </div>

      <Tabs defaultValue='general'>
        <TabsList className='grid w-full grid-cols-2 max-w-100'>
          <TabsTrigger value='general'>Thông tin cửa hàng</TabsTrigger>
          <TabsTrigger value='security'>Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Thông tin này sẽ được hiển thị trên trang chủ và phần liên hệ.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConfig ? <p>Đang tải...</p> : <GeneralSettingsForm initialData={configData.metadata} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Thay đổi mật khẩu đăng nhập của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='currentPassword'>Mật khẩu hiện tại</Label>
                  <Input
                    id='currentPassword'
                    type='password'
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='newPassword'>Mật khẩu mới</Label>
                  <Input
                    id='newPassword'
                    type='password'
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='confirmPassword'>Xác nhận mật khẩu mới</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <Button variant='gold' type='submit'>
                  Đổi mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminSettings
