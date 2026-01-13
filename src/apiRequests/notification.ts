import { request } from '@/lib/api'
import type { CreateNotificationReqBody } from '@/lib/schemas/notification.schema'

export const notificationApiRequest = {
  createNotification: (body: CreateNotificationReqBody) => request.post('/notifications', body),
  getNotifications: () => request.get('/notifications'),
  markAsRead: (id: string) => request.patch(`/notifications/${id}/read`),
  markAllAsRead: () => request.patch('/notifications/read-all'),
  deleteNotification: (id: string) => request.delete(`/notifications/${id}`)
}

export default notificationApiRequest
