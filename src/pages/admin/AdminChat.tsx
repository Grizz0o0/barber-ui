import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { Search, Send, User as UserIcon, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Conversation, type ChatMessage } from '@/apiRequests/chat'
import { useGetConversations, useGetMessages, useDeleteMessage } from '@/queries/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// Default to local if not set
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3052'

const ConversationItem = React.memo(
  ({
    conversation,
    isActive,
    onClick
  }: {
    conversation: Conversation
    isActive: boolean
    onClick: (id: string) => void
  }) => {
    const customer = conversation.participants[0] || {}

    return (
      <button
        onClick={() => onClick(conversation._id)}
        className={cn(
          'flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/40',
          isActive && 'bg-muted'
        )}
      >
        <Avatar>
          <AvatarImage src={customer.avatar} />
          <AvatarFallback>{customer.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <span className='font-medium truncate'>{customer.name || 'Khách hàng'}</span>
            <span className='text-xs text-muted-foreground'>
              {conversation.updatedAt
                ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
          <p className='text-sm text-muted-foreground truncate'>
            {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
          </p>
        </div>
      </button>
    )
  }
)

export default function AdminChat() {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()
  const deleteMessageMutation = useDeleteMessage()
  const navigate = useNavigate()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const activeConversationId = searchParams.get('conversationId')

  const activeConversationIdRef = useRef<string | null>(null)
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync ref for socket listener access
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  // 1. Fetch Conversations via React Query
  const { data: conversationsData, isLoading: isConversationsLoading } = useGetConversations()
  const conversations = conversationsData?.metadata || []

  // 2. Fetch Messages for Active Conversation
  const { data: messagesData } = useGetMessages(activeConversationId || '')
  const messages = messagesData?.metadata || []
  // 3. Setup Socket (One-time connection)
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {})

    newSocket.on('receive_message', (message: ChatMessage) => {
      // Use REF to get current active ID inside closure
      const currentActiveId = activeConversationIdRef.current

      // If message belongs to active conversation, append it to cache
      if (currentActiveId === message.conversationId) {
        queryClient.setQueryData(['messages', currentActiveId], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            metadata: [...oldData.metadata, message]
          }
        })
      }

      // Update conversation list preview in cache
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData
        const newMetadata = oldData.metadata
          .map((c: Conversation) => {
            if (c._id === message.conversationId) {
              return {
                ...c,
                lastMessage: {
                  content: message.content,
                  sender: message.sender,
                  createdAt: message.createdAt
                },
                updatedAt: message.createdAt
              }
            }
            return c
          })
          .sort((a: Conversation, b: Conversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        return {
          ...oldData,
          metadata: newMetadata
        }
      })
    })

    newSocket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
      const currentActiveId = activeConversationIdRef.current
      if (currentActiveId === data.conversationId) {
        queryClient.setQueryData(['messages', currentActiveId], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            metadata: oldData.metadata.filter((m: ChatMessage) => m._id !== data.messageId)
          }
        })
      }
      // Refresh conversation list to update preview if last message was deleted
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socketRef.current = newSocket

    return () => {
      newSocket.disconnect()
    }
  }, [queryClient]) // Run once on mount

  // 4. Join Room when Active Conversation Changes
  useEffect(() => {
    if (activeConversationId && socketRef.current) {
      socketRef.current.emit('join_conversation', activeConversationId)
    }
  }, [activeConversationId])

  // 5. Handle Conversation Selection
  const handleSelectConversation = useCallback(
    (convId: string) => {
      navigate(`?conversationId=${convId}`, { replace: true })
    },
    [navigate]
  )

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Bạn có chắc muốn xóa tin nhắn này không?')) {
      deleteMessageMutation.mutate(messageId)
    }
  }

  // 6. Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeConversationId || !socketRef.current || !user) return

    const payload = {
      conversationId: activeConversationId,
      sender: user._id, // Admin ID
      content: inputText
    }

    // Optimistically update UI (optional but good for UX) - forcing refresh from cache via socket event is safer for consistency
    // But for instant feedback we rely on the socket 'receive_message' which acts as ack if backend broadcasts back to sender too.
    // Assuming backend broadcasts to room including sender:
    socketRef.current.emit('send_message', payload)
    setInputText('')
  }

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    // Auto scroll when messages change or panel opens
  }, [messages, activeConversationId])

  const activeConversation = conversations.find((c) => c._id === activeConversationId)

  return (
    <div className='flex h-[calc(100vh-(--spacing(20)))] border rounded-xl overflow-hidden bg-card shadow-sm'>
      {/* Sidebar List */}
      <div className='w-80 border-r border-border flex flex-col'>
        <div className='p-4 border-b border-border'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input type='search' placeholder='Tìm kiếm...' className='pl-9 bg-background' />
          </div>
        </div>

        <ScrollArea className='flex-1'>
          <div className='flex flex-col'>
            {isConversationsLoading ? (
              <div className='p-4 space-y-4'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-muted animate-pulse' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                      <div className='h-3 w-full bg-muted animate-pulse rounded' />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onClick={handleSelectConversation}
                />
              ))
            )}
            {!isConversationsLoading && conversations.length === 0 && (
              <div className='p-8 text-center text-muted-foreground'>Chưa có cuộc hội thoại nào</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col bg-muted/10'>
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className='p-4 border-b border-border bg-card flex items-center justify-between shadow-sm z-10'>
              <div className='flex items-center gap-3'>
                <Avatar>
                  {/* Displaying active user info */}
                  {activeConversation?.participants[0] && (
                    <>
                      <AvatarImage src={activeConversation.participants[0].avatar} />
                      <AvatarFallback>
                        {activeConversation.participants[0].name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div>
                  <h3 className='font-bold'>{activeConversation?.participants[0]?.name || 'Khách hàng'}</h3>
                  <span className='text-xs text-green-500 flex items-center gap-1'>
                    <span className='block w-2 h-2 rounded-full bg-green-500'></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 p-4'>
              <div className='space-y-4 max-w-3xl mx-auto'>
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === user?._id
                  return (
                    <div key={idx} className={cn('flex w-full group', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn('flex items-end gap-2 max-w-[70%]', isMe ? 'flex-row-reverse' : 'flex-row')}>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2 text-sm shadow-sm relative',
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-card border border-border rounded-tl-none'
                          )}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={cn(
                              'text-[10px] block mt-1 opacity-70',
                              isMe ? 'text-blue-100' : 'text-muted-foreground'
                            )}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isMe && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                            onClick={() => handleDeleteMessage(msg._id)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className='p-4 bg-card border-t border-border'>
              <form onSubmit={handleSendMessage} className='flex gap-2 max-w-3xl mx-auto'>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='Nhập tin nhắn...'
                  className='flex-1'
                />
                <Button type='submit' size='icon' disabled={!inputText.trim()}>
                  <Send className='w-4 h-4' />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-muted-foreground'>
            <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4'>
              <UserIcon className='w-8 h-8 opacity-50' />
            </div>
            <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  )
}
