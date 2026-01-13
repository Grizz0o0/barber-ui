import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  fullScreen?: boolean
  className?: string
  text?: string
}

const PageLoader = ({ fullScreen = false, className = '', text = 'Đang tải...' }: PageLoaderProps) => {
  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4'>
        <Loader2 className='w-12 h-12 text-primary animate-spin mb-4' />
        <p className='text-muted-foreground animate-pulse'>{text}</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className='w-8 h-8 text-primary animate-spin mb-3' />
      <p className='text-muted-foreground text-sm'>{text}</p>
    </div>
  )
}

export default PageLoader
