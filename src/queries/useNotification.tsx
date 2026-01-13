import notificationApiRequest from '@/apiRequests/notification'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateNotificationReqBody } from '@/lib/schemas/notification.schema'

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApiRequest.getNotifications()
  })
}

export const useCreateNotificationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateNotificationReqBody) => notificationApiRequest.createNotification(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApiRequest.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApiRequest.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApiRequest.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
