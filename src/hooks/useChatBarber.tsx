import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useGetMyConversation, useGetMessages, useDeleteMessage } from '@/queries/useChat'
import type { ChatMessage } from '@/apiRequests/chat'
import { useQueryClient } from '@tanstack/react-query'

// Default to local if not set, matching backend config
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3052'

export const useChatBarber = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const deleteMessageMutation = useDeleteMessage()

  // 1. Get Conversation ID
  const { data: conversationData } = useGetMyConversation(!!userId)
  const conversationId = conversationData?.metadata?._id || null
  const conversationIdRef = useRef(conversationId)

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  // 2. Get History
  const { data: messagesData } = useGetMessages(conversationId)

  useEffect(() => {
    if (!userId) return

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('receive_message', (message: ChatMessage) => {
      const currentConvId = conversationIdRef.current
      if (currentConvId) {
        queryClient.setQueryData(['messages', currentConvId], (oldData: any) => {
          if (!oldData) return { metadata: [message] }
          return {
            ...oldData,
            metadata: [...(oldData.metadata || []), message]
          }
        })
      }
    })

    newSocket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
      const currentConvId = conversationIdRef.current
      if (currentConvId === data.conversationId) {
        queryClient.setQueryData(['messages', currentConvId], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            metadata: oldData.metadata.filter((m: ChatMessage) => m._id !== data.messageId)
          }
        })
      }
    })

    newSocket.on('error', (err: string) => {
      toast.error(err)
    })

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  useEffect(() => {
    if (isConnected && conversationId && socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId)
    }
  }, [isConnected, conversationId])

  const joinConversation = (convId: string) => {
    // Manual join deprecated for user, but kept for compatibility
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', convId)
    }
  }

  const sendMessage = (content: string) => {
    if (socketRef.current && conversationId && userId) {
      const payload = { conversationId, sender: userId, content }
      socketRef.current.emit('send_message', payload)
    }
  }

  const deleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId)
  }

  return {
    isConnected,
    messages: messagesData?.metadata || [],
    sendMessage,
    deleteMessage,
    joinConversation,
    conversationId
  }
}
