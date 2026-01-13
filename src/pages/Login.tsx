import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Scissors, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Đăng nhập thành công', {
        description: 'Chào mừng bạn quay trở lại!'
      })
      navigate('/')
    } catch (error) {
      const err = error as Error
      toast.error('Đăng nhập thất bại', {
        description: err.message || 'Vui lòng kiểm tra lại thông tin'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <Link to='/' className='inline-flex items-center gap-2'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_4px_30px_hsl(38_92%_50%/0.3)]'>
              <Scissors className='w-6 h-6 text-primary-foreground' />
            </div>
            <span className='font-display text-2xl font-bold text-foreground'>BarberShop</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className='bg-card border border-border rounded-2xl p-8'>
          <div className='text-center mb-6'>
            <h1 className='font-display text-2xl font-bold text-foreground mb-2'>Đăng nhập</h1>
            <p className='text-muted-foreground'>Chào mừng bạn quay trở lại</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='email@example.com'
                {...register('email')}
                className='bg-secondary border-border'
              />
              {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  {...register('password')}
                  className='bg-secondary border-border pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.password && <p className='text-destructive text-sm'>{errors.password.message}</p>}
            </div>

            <Button type='submit' variant='gold' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
              Đăng nhập
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-muted-foreground text-sm'>
              Chưa có tài khoản?{' '}
              <Link to='/register' className='text-primary hover:underline font-medium'>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className='mt-6 text-center'>
          <Link to='/' className='text-muted-foreground hover:text-foreground text-sm'>
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
