import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import aiApiRequest from '@/apiRequests/ai'
import { toast } from 'sonner'

export interface Message {
  role: 'user' | 'model'
  text: string
}

export function useChatAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      // Prepare history for API
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))

      const response = await aiApiRequest.chat({ message, history })
      return response
    },
    onSuccess: (data) => {
      const botMessage = data.metadata?.message
      if (botMessage) {
        setMessages((prev) => [...prev, { role: 'model', text: botMessage }])
      }
    },
    onError: (error) => {
      console.error(error)
      toast.error('Có lỗi xảy ra kết nối với AI')
    }
  })

  // Optimistic update
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    sendMessage(text)
  }

  const toggleChat = () => setIsOpen((prev) => !prev)

  return {
    isOpen,
    toggleChat,
    messages,
    sendMessage: handleSendMessage,
    isPending
  }
}
