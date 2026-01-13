import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyEmailMutation } from '@/queries/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const verifyEmailMutation = useVerifyEmailMutation()

  useEffect(() => {
    const verify = () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Missing token or email parameter.')
        return
      }

      verifyEmailMutation.mutate(
        { email, verifyEmailToken: token },
        {
          onSuccess: () => {
            setStatus('success')
            setMessage('Your email has been successfully verified. You can now log in.')
          },
          onError: (error: any) => {
            setStatus('error')
            setMessage(error.message || 'Verification failed. The link may be invalid or expired.')
          }
        }
      )
    }

    verify()
  }, [searchParams])

  return (
    <div className='flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            {status === 'loading' && <Loader2 className='h-12 w-12 text-primary animate-spin' />}
            {status === 'success' && <CheckCircle className='h-12 w-12 text-green-500' />}
            {status === 'error' && <XCircle className='h-12 w-12 text-red-500' />}
          </div>
          <CardTitle className='text-2xl font-bold'>Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Verified!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-neutral-600 dark:text-neutral-400'>{message}</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button onClick={() => navigate('/login')} className='w-full'>
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VerifyEmail
