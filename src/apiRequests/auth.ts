import { request, apiClient, getRefreshToken } from '@/lib/api'
import type {
  registerReqBodyType,
  loginReqBodyType,
  verifyEmailReqBodyType,
  verifyForgotPasswordReqBodyType,
  resetPasswordReqBodyType,
  changePasswordReqBodyType
} from '@/lib/schemas/auth.schema'

export const authApiRequest = {
  register: (body: registerReqBodyType) => request.post('/auth/register', body),
  login: (body: loginReqBodyType) => request.post('/auth/login', body),
  logout: () => {
    const refreshToken = getRefreshToken()
    return apiClient('/auth/logout', {
      method: 'POST',
      headers: { 'x-rtoken-id': refreshToken || '' }
    })
  },
  refreshToken: () => {
    const refreshToken = getRefreshToken()
    return apiClient('/auth/refresh-token', {
      method: 'POST',
      headers: { 'x-rtoken-id': refreshToken || '' }
    })
  },
  verifyEmail: (body: verifyEmailReqBodyType) => request.post('/auth/verify-email', body),
  resendVerifyEmail: (email: string) => request.post('/auth/resend-verify-email', { email }),
  forgotPassword: (email: string) => request.post('/auth/forgot-password', { email }),
  verifyForgotPassword: (body: verifyForgotPasswordReqBodyType) => request.post('/auth/verify-forgot-password', body),
  resetPassword: (body: resetPasswordReqBodyType) => request.post('/auth/reset-password', body),
  changePassword: (body: changePasswordReqBodyType) => request.post('/auth/change-password', body)
}

export default authApiRequest
