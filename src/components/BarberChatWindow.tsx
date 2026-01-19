import { useRef, useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatBarber } from '@/hooks/useChatBarber'
import { useAccountMe } from '@/queries/useAccount'
import { cn } from '@/lib/utils'

export default function BarberChatWindow() {
  const { data: userProfile } = useAccountMe()
  const userId = userProfile?.metadata?._id

  // Hardcoded conversation ID for now (e.g. user ID itself as room)
  // In real app, we fetch this from API.
  const roomName = userId

  const { messages, sendMessage, joinConversation, isConnected, deleteMessage } = useChatBarber(userId)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (roomName && isConnected) {
      joinConversation(roomName)
    }
  }, [roomName, isConnected])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    sendMessage(inputValue)
    setInputValue('')
  }

  const handleDelete = (messageId: string) => {
    if (confirm('Bạn có muốn xóa tin nhắn này?')) {
      deleteMessage(messageId)
    }
  }

  return (
    <>
      {/* Messages Area */}
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4'>
          {messages.length === 0 && (
            <div className='text-center text-muted-foreground py-10'>
              <p>Kết nối với nhân viên hỗ trợ...</p>
              <p className='text-xs'>Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.sender === userId
            return (
              <div key={idx} className={cn('flex w-full group', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('flex items-end gap-2 max-w-[80%]', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2 text-sm shadow-md',
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-zinc-800 text-slate-100 border border-zinc-700 rounded-tl-none'
                    )}
                  >
                    <p>{msg.content}</p>
                  </div>
                  {isMe && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                      onClick={() => handleDelete(msg._id)}
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

      {/* Input Area */}
      <div className='p-4 border-t border-border bg-background/50 backdrop-blur-sm'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Nhập tin nhắn hỗ trợ...'
            className='flex-1 focus-visible:ring-blue-600'
            disabled={!isConnected}
          />
          <Button
            type='submit'
            size='icon'
            disabled={!inputValue.trim() || !isConnected}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            <Send className='w-4 h-4' />
          </Button>
        </form>
      </div>
    </>
  )
}
