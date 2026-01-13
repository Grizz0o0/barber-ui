import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const StarRating = ({ rating, onRate, interactive = false, size = 'md' }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0)

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
        >
          <Star
            className={`${iconSize[size]} transition-colors ${
              star <= (hovered || rating) ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
