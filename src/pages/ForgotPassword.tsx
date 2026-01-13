import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForgotPasswordMutation } from '@/queries/useAuth'

const emailSchema = z.string().email('Email không hợp lệ')

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const forgotPasswordMutation = useForgotPasswordMutation()

  // Handling side effects outside the hook instantiation if needed, or inline in mutate.
  // The existing code used useMutation with onSuccess/onError defined there.
  // The imported hook returns a mutation object.
  // We should attach callbacks to mutate or ensure the hook supports them if passed (usually not if it's a custom hook wrapping useMutation without args).
  // My custom hooks usually just return useMutation({...})
  // So I can't pass options to the hook function call if it doesn't accept them.
  // But wait, the hook implementation I saw:
  // export const useForgotPasswordMutation = () => { return useMutation({ mutationFn: ... }) }
  // It returns the mutation object.
  // So I can't customize onSuccess inside the hook definition unless I modify the hook to accept options or use mutate's callbacks.
  // Best practice with this pattern (simple wrapper) is to use mutate({ onSuccess, onError }) OR update usage to use .mutate(variables, { onSuccess, onError }).

  // The easiest refactor here without changing logic flow too much is to use .mutate's second argument.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    forgotPasswordMutation.mutate(email, {
      onSuccess: () => {
        setIsSuccess(true)
        toast.success('Email đã được gửi', {
          description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.'
        })
      },
      onError: (error: any) => {
        setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
      }
    })
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
          {!isSuccess ? (
            <>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Mail className='w-8 h-8 text-primary' />
                </div>
                <h2 className='text-2xl font-bold mb-2'>Quên mật khẩu?</h2>
                <p className='text-muted-foreground'>Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu</p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='your@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='mt-1'
                    disabled={forgotPasswordMutation.isPending}
                  />
                  {error && <p className='text-destructive text-sm mt-1'>{error}</p>}
                </div>

                <Button
                  type='submit'
                  variant='gold'
                  className='w-full'
                  disabled={forgotPasswordMutation.isPending || !email}
                >
                  {forgotPasswordMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className='text-center py-4'>
              <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Check className='w-8 h-8 text-green-500' />
              </div>
              <h2 className='text-2xl font-bold mb-2'>Kiểm tra email của bạn</h2>
              <p className='text-muted-foreground mb-6'>
                Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className='text-foreground'>{email}</strong>
              </p>
              <p className='text-sm text-muted-foreground mb-6'>
                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    forgotPasswordMutation.reset()
                  }}
                  className='text-primary hover:underline'
                >
                  thử lại
                </button>
              </p>
              <Button variant='outline' asChild className='w-full'>
                <Link to='/login'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Quay lại đăng nhập
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Back Link */}
        {!isSuccess && (
          <div className='text-center mt-6'>
            <Link
              to='/login'
              className='text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2'
            >
              <ArrowLeft className='w-4 h-4' />
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
