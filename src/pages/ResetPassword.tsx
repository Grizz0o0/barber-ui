import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { z } from 'zod'
import { useResetPasswordMutation } from '@/queries/useAuth'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const resetPasswordMutation = useResetPasswordMutation()

  useEffect(() => {
    if (!token) {
      toast.error('Đường dẫn không hợp lệ hoặc đã hết hạn')
      navigate('/login')
    }
  }, [token, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = resetPasswordSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: { [key: string]: string } = {}
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message
      })
      setErrors(newErrors)
      return
    }

    if (!token) return

    resetPasswordMutation.mutate(
      {
        forgotPasswordToken: token,
        password: formData.password,
        confirm_password: formData.confirmPassword
      },
      {
        onSuccess: () => {
          toast.success('Đặt lại mật khẩu thành công', {
            description: 'Vui lòng đăng nhập với mật khẩu mới.'
          })
          navigate('/login')
        },
        onError: (error: any) => {
          toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
        }
      }
    )
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <Link to='/' className='inline-block'>
            <h1 className='font-display text-3xl font-bold'>
              <span className='text-primary'>BLADE</span>
              <span className='text-foreground'>STYLE</span>
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className='bg-card border border-border rounded-2xl p-8 shadow-lg'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Lock className='w-8 h-8 text-primary' />
            </div>
            <h2 className='text-2xl font-bold mb-2'>Đặt lại mật khẩu</h2>
            <p className='text-muted-foreground'>Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Password */}
            <div>
              <Label htmlFor='password'>Mật khẩu mới</Label>
              <div className='relative mt-1'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.password && <p className='text-destructive text-sm mt-1'>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
              <div className='relative mt-1'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.confirmPassword && <p className='text-destructive text-sm mt-1'>{errors.confirmPassword}</p>}
            </div>

            <Button type='submit' variant='gold' className='w-full' disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Đang xử lý...
                </span>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>
          </form>
        </div>

        {/* Back Link */}
        <div className='text-center mt-6'>
          <Link
            to='/login'
            className='text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
