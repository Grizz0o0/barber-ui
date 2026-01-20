import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateMeSchema, type updateMeReqBodyType } from '@/lib/schemas/user.schema'
import { useUpdateMeMutation } from '@/queries/useAccount'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChangePasswordForm from '@/components/ChangePasswordForm'

const BarberProfile = () => {
  const { user, refetchUser } = useAuth()
  const updateMeMutation = useUpdateMeMutation()

  const form = useForm<updateMeReqBodyType>({
    resolver: zodResolver(updateMeSchema.body),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        district: ''
      }
    }
  })

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: typeof user.address === 'object' ? user.address : { street: user.address || '' },
        avatar: user.avatar
      })
    }
  }, [user, form])

  const onSubmit = (values: updateMeReqBodyType) => {
    updateMeMutation.mutate(values, {
      onSuccess: async (data) => {
        toast.success(data.message)
        await refetchUser()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Cập nhật thất bại')
      }
    })
  }

  return (
    <div className='max-w-4xl mx-auto p-6 lg:p-8 space-y-8'>
      <div>
        <h1 className='font-display text-2xl md:text-3xl font-bold'>Hồ sơ cá nhân</h1>
        <p className='text-muted-foreground'>Quản lý thông tin cá nhân và tài khoản.</p>
      </div>

      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-8'>
          <TabsTrigger value='general'>Thông tin chung</TabsTrigger>
          <TabsTrigger value='password'>Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value='general'>
          <Card className='bg-card/50 border-border/50'>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder='Nhập họ và tên' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='email@example.com' {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder='09xxxxxxxx' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='address.city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder='Hồ Chí Minh' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='address.district'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quận/Huyện</FormLabel>
                          <FormControl>
                            <Input placeholder='Quận 1' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='address.street'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ chi tiết</FormLabel>
                        <FormControl>
                          <Input placeholder='123 Đường ABC' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type='submit' className='w-full' disabled={updateMeMutation.isPending}>
                    {updateMeMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='password'>
          <Card className='bg-card/50 border-border/50'>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BarberProfile
