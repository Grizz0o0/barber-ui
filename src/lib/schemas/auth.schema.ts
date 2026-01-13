import { z } from 'zod'

// Shared constants/schemas
const strongPasswordSchema = z
  .string({ error: 'Mật khẩu không được để trống' })
  .trim()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[^a-zA-Z0-9]/.test(value), {
    message: 'Mật khẩu phải có ít nhất 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
  })

export const loginSchema = {
  body: z.object({
    email: z.email('Email không hợp lệ').trim(),
    password: strongPasswordSchema
  })
}
export type loginReqBodyType = z.infer<typeof loginSchema.body>

export const registerSchema = {
  body: z
    .object({
      name: z
        .string({ error: 'Tên người dùng không được để trống' })
        .trim()
        .min(1, 'Tên người dùng phải có từ 1 đến 255 ký tự')
        .max(255),
      email: z.email('Email không hợp lệ').trim(),
      phone: z
        .string({ error: 'Số điện thoại không được để trống' })
        .trim()
        .regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)'),
      password: strongPasswordSchema,
      confirm_password: z.string({ error: 'Xác nhận mật khẩu không được để trống' })
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_password']
    })
}
export type registerReqBodyType = z.infer<typeof registerSchema.body>

export const verifyEmailSchema = {
  body: z.object({
    email: z.email('Email không hợp lệ').trim(),
    verifyEmailToken: z.string({ error: 'verifyEmailToken không được để trống' }).trim()
  })
}
export type verifyEmailReqBodyType = z.infer<typeof verifyEmailSchema.body>

export const resendVerifyEmailSchema = {
  body: z.object({
    email: z.email('Email không hợp lệ').trim()
  })
}
export type resendVerifyEmailReqBodyType = z.infer<typeof resendVerifyEmailSchema.body>

export const forgotPasswordSchema = {
  body: z.object({
    email: z.email('Email không hợp lệ').trim()
  })
}
export type forgotPasswordReqBodyType = z.infer<typeof forgotPasswordSchema.body>

export const verifyForgotPasswordSchema = {
  body: z.object({
    forgotPasswordToken: z
      .string({
        error: 'forgotPasswordToken không được để trống'
      })
      .trim(),
    email: z.email('Email không hợp lệ').trim()
  })
}
export type verifyForgotPasswordReqBodyType = z.infer<typeof verifyForgotPasswordSchema.body>

export const resetPasswordSchema = {
  body: z
    .object({
      password: strongPasswordSchema,
      confirm_password: z
        .string({
          error: 'Xác nhận mật khẩu không được để trống'
        })
        .trim(),
      forgotPasswordToken: z
        .string({
          error: 'forgotPasswordToken không được để trống'
        })
        .trim()
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_password']
    })
}
export type resetPasswordReqBodyType = z.infer<typeof resetPasswordSchema.body>

export const changePasswordSchema = {
  body: z
    .object({
      password: strongPasswordSchema,
      newPassword: strongPasswordSchema,
      confirm_newPassword: z
        .string({
          error: 'Xác nhận mật khẩu không được để trống'
        })
        .trim()
    })
    .refine((data) => data.newPassword === data.confirm_newPassword, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_newPassword']
    })
}
export type changePasswordReqBodyType = z.infer<typeof changePasswordSchema.body>
