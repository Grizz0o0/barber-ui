import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUploadImageMutation } from '@/queries/useMedia'
import { Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
  disabled?: boolean
}

export const ImageUpload = ({ value, onChange, className, disabled }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadImageMutation = useUploadImageMutation()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    try {
      setLoading(true)
      const res = await uploadImageMutation.mutateAsync(file)
      // Update to handle metadata.image from backend
      const url =
        res.metadata?.image?.files?.[0]?.url ||
        res.metadata?.image ||
        (typeof res.metadata === 'string' ? res.metadata : res.metadata?.url)

      if (url) {
        onChange(url)
        toast.success('Tải ảnh lên thành công')
      } else {
        throw new Error('Không nhận được URL ảnh')
      }
    } catch (error) {
      console.error(error)
      toast.error('Tải ảnh thất bại')
    } finally {
      setLoading(false)
      // Reset input value to allow selecting the same file again if needed
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className={cn('space-y-4 w-full', className)}>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleUpload}
        disabled={disabled || loading}
      />

      {value ? (
        <div className='relative aspect-square w-40 h-40 rounded-lg border overflow-hidden group'>
          <img
            src={value}
            alt='Uploaded'
            className='w-full h-full object-cover transition-opacity group-hover:opacity-90'
          />
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40'>
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='h-8 w-8'
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center w-full max-w-xs h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer',
            (disabled || loading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <span className='text-sm text-muted-foreground'>Đang tải lên...</span>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              <div className='p-2 rounded-full bg-muted'>
                <Upload className='h-5 w-5' />
              </div>
              <div className='text-center space-y-1'>
                <p className='text-sm font-medium text-foreground'>Bấm để chọn ảnh</p>
                <p className='text-xs'>hoặc kéo thả vào đây</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
