import authApiRequest from '@/apiRequests/auth'
import { useMutation } from '@tanstack/react-query'
import type {
  registerReqBodyType,
  loginReqBodyType,
  verifyForgotPasswordReqBodyType,
  resetPasswordReqBodyType
} from '@/lib/schemas/auth.schema'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (body: loginReqBodyType) => authApiRequest.login(body)
  })
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (body: registerReqBodyType) => authApiRequest.register(body)
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApiRequest.logout()
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApiRequest.forgotPassword(email)
  })
}

export const useVerifyForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (body: verifyForgotPasswordReqBodyType) => authApiRequest.verifyForgotPassword(body)
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (body: resetPasswordReqBodyType) => authApiRequest.resetPassword(body)
  })
}

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (body: { email: string; verifyEmailToken: string }) => authApiRequest.verifyEmail(body)
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (body: any) => authApiRequest.changePassword(body)
  })
}
