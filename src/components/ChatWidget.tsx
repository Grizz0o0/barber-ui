import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatAI } from '@/hooks/useChatAI'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import BarberChatWindow from './BarberChatWindow'

export default function ChatWidget() {
  const { isOpen, toggleChat, messages, sendMessage, isPending } = useChatAI()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<'ai' | 'barber'>('ai')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activeTab])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    sendMessage(inputValue)
    setInputValue('')
  }

  const renderAIChat = () => (
    <>
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-4'>
          {messages.length === 0 && (
            <div className='text-center text-muted-foreground py-10'>
              <p>Xin chào! Tôi là trợ lý AI ảo.</p>
              <p>Tôi có thể giúp bạn tư vấn kiểu tóc, đặt lịch, và giải đáp thắc mắc.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-zinc-800 text-slate-100 border border-zinc-700 rounded-tl-none'
                )}
              >
                <div
                  className={cn(
                    'prose prose-sm max-w-none wrap-break-word leading-relaxed',
                    msg.role === 'model'
                      ? 'prose-invert'
                      : 'text-primary-foreground prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground'
                  )}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isPending && (
            <div className='flex justify-start'>
              <div className='bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1'>
                <Loader2 className='w-3 h-3 animate-spin' />
                <span className='text-xs'>Đang nhập...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className='p-4 border-t border-border bg-background/50 backdrop-blur-sm'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Nhập tin nhắn...'
            className='flex-1 focus-visible:ring-primary'
            disabled={isPending}
          />
          <Button
            type='submit'
            size='icon'
            disabled={!inputValue.trim() || isPending}
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
          >
            <Send className='w-4 h-4' />
          </Button>
        </form>
      </div>
    </>
  )

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none'>
      {/* Chat Window */}
      <div
        className={cn(
          'mb-4 w-w-87.5 sm:w-100 h-125 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto',
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className='bg-primary/10 border-b border-border'>
          <div className='flex items-center justify-between p-3 pb-0'>
            <div className='flex gap-2'>
              <button
                onClick={() => setActiveTab('ai')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors',
                  activeTab === 'ai'
                    ? 'bg-card text-primary border-t border-x border-border -mb-px relative z-10'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                )}
              >
                <Bot className='w-4 h-4' />
                AI Barber
              </button>
              <button
                onClick={() => setActiveTab('barber')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors',
                  activeTab === 'barber'
                    ? 'bg-card text-blue-500 border-t border-x border-border -mb-px relative z-10'
                    : 'text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500'
                )}
              >
                <User className='w-4 h-4' />
                Hỗ trợ
              </button>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8 -mt-2' onClick={toggleChat}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'ai' ? renderAIChat() : <BarberChatWindow />}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={toggleChat}
        size='lg'
        className={cn(
          'rounded-full w-14 h-14 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200 pointer-events-auto',
          isOpen
            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
            : 'bg-gradient-gold text-primary-foreground'
        )}
      >
        {isOpen ? <X className='w-6 h-6' /> : <MessageCircle className='w-6 h-6' />}
      </Button>
    </div>
  )
}
