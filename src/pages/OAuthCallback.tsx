import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { setTokens, setUserId } from '@/lib/api'

const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refetchUser } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const userId = searchParams.get('userId')

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken)
      if (userId) setUserId(userId)
      refetchUser().then(() => {
        navigate('/')
      })
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate, refetchUser])

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-full max-w-md text-center space-y-4'>
        <div className='w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto'></div>
        <p className='text-muted-foreground'>Đang xử lý đăng nhập...</p>
      </div>
    </div>
  )
}

export default OAuthCallback
