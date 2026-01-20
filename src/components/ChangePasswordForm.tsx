import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { changePasswordSchema, type changePasswordReqBodyType } from '@/lib/schemas/auth.schema'
import { useChangePasswordMutation } from '@/queries/useAuth'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const ChangePasswordForm = () => {
  const changePasswordMutation = useChangePasswordMutation()

  const form = useForm<changePasswordReqBodyType>({
    resolver: zodResolver(changePasswordSchema.body),
    defaultValues: {
      password: '',
      newPassword: '',
      confirm_newPassword: ''
    }
  })

  const onSubmit = (values: changePasswordReqBodyType) => {
    changePasswordMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success(data.message || 'Đổi mật khẩu thành công')
        form.reset()
      },
      onError: (error: any) => {
        toast.error(error.message || 'Đổi mật khẩu thất bại')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 max-w-md'>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu hiện tại</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Nhập mật khẩu hiện tại' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Nhập mật khẩu mới' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirm_newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Nhập lại mật khẩu mới' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Đổi mật khẩu
        </Button>
      </form>
    </Form>
  )
}

export default ChangePasswordForm
