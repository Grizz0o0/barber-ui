import { request } from '@/lib/api'

export const mediaApiRequest = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return request.post('/medias/upload-image', formData)
  }
}

export default mediaApiRequest
