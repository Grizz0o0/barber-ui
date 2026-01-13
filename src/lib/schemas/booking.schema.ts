import { z } from 'zod'

export const createBookingSchema = {
  body: z.object({
    user: z.string().optional(),
    guestName: z.string().optional(),
    guestPhone: z.string().optional(),
    barber: z.string({ error: 'Barber ID là bắt buộc' }).trim().min(1, 'Barber ID không được để trống'),
    service: z.string({ error: 'Service ID là bắt buộc' }).trim().min(1, 'Service ID không được để trống'),
    startTime: z
      .string({ error: 'Thời gian bắt đầu là bắt buộc' })
      .datetime({ message: 'Thời gian bắt đầu phải là định dạng ISO 8601 hợp lệ' }),
    notes: z.string().optional(),
    promotion: z.string().optional(),
    source: z.enum(['online', 'walk-in', 'admin']).optional()
  })
}

export type CreateBookingReqBody = z.infer<typeof createBookingSchema.body>

export const updateBookingSchema = {
  params: z.object({
    id: z.string().trim().min(1, 'Id không được để trống')
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
    paymentStatus: z.enum(['unpaid', 'paid', 'refunded']).optional(),
    notes: z.string().optional(),
    barber: z.string().trim().min(1).optional(),
    service: z.string().trim().min(1).optional(),
    startTime: z.string().datetime().optional()
  })
}

export type UpdateBookingReqBody = z.infer<typeof updateBookingSchema.body>
export type UpdateBookingReqParams = z.infer<typeof updateBookingSchema.params>

export const deleteBookingSchema = {
  params: z.object({
    id: z.string().trim().min(1, 'Id không được để trống')
  })
}

export type DeleteBookingReqParams = z.infer<typeof deleteBookingSchema.params>

export const getBookingSchema = {
  query: z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    sortBy: z.enum(['createdAt', 'startTime', 'status']).optional(),
    barber: z.string().optional(),
    user: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  })
}

export type GetBookingQuery = z.infer<typeof getBookingSchema.query>

export const emergencyActionSchema = {
  body: z.object({
    barberId: z.string({ error: 'Barber ID is required' }).min(1),
    date: z.string().datetime(), // ISO date for the day to block
    action: z.enum(['cancel', 'move']),
    targetBarberId: z.string().optional() // Required if action is 'move'
  })
}

export type EmergencyActionReqBody = z.infer<typeof emergencyActionSchema.body>
