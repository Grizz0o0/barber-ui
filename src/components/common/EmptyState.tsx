import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ElementType
  action?: ReactNode
  className?: string
}

export const EmptyState = ({ title, description, icon: Icon, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50', className)}>
      {Icon && (
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
          <Icon className='h-8 w-8 text-muted-foreground' />
        </div>
      )}
      <h3 className='text-lg font-semibold'>{title}</h3>
      {description && <p className='mt-2 text-sm text-muted-foreground max-w-sm'>{description}</p>}
      {action && <div className='mt-6'>{action}</div>}
    </div>
  )
}

export default EmptyState
