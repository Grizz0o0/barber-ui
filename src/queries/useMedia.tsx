import mediaApiRequest from '@/apiRequests/media'
import { useMutation } from '@tanstack/react-query'

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: (file: File) => mediaApiRequest.uploadImage(file)
  })
}
