import { request } from '@/lib/api'

export interface Conversation {
  _id: string
  participants: any[]
  lastMessage: {
    content: string
    sender: string
    createdAt: string
  }
  updatedAt: string
  createdAt: string
}

export interface ChatMessage {
  _id: string
  conversationId: string
  sender: string
  content: string
  createdAt: string
  isRead: boolean
}

const chatApiRequest = {
  getMyConversation: () => request.get<{ message: string; metadata: Conversation }>('/chat/my-conversation'),
  getConversations: () => request.get<{ message: string; metadata: Conversation[] }>('/chat/conversations'),
  getAllConversations: () => request.get<{ message: string; metadata: Conversation[] }>('/chat/conversations/all'),
  getMessages: (conversationId: string) =>
    request.get<{ message: string; metadata: ChatMessage[] }>(`/chat/messages/${conversationId}`),
  deleteMessage: (messageId: string) =>
    request.delete<{ message: string; metadata: boolean }>(`/chat/messages/${messageId}`)
}

export default chatApiRequest
