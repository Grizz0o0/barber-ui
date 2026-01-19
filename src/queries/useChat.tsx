import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import chatApiRequest from '@/apiRequests/chat'

export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApiRequest.getAllConversations
  })
}

export const useGetMyConversation = (enabled = true) => {
  return useQuery({
    queryKey: ['my-conversation'],
    queryFn: chatApiRequest.getMyConversation,
    enabled
  })
}

export const useGetMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApiRequest.getMessages(conversationId!),
    enabled: !!conversationId
  })
}

export const useDeleteMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: chatApiRequest.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })
}
