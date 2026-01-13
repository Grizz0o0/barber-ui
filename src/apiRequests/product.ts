import { request } from '@/lib/api'
import type { CreateProductReqBody, UpdateProductReqBody } from '@/lib/schemas/product.schema'

export const productApiRequest = {
  getProducts: (page = 1, limit = 10) => request.get('/products', { page, limit }),
  getProduct: (id: string) => request.get(`/products/${id}`),
  createProduct: (body: CreateProductReqBody) => request.post('/products', body),
  updateProduct: (id: string, body: UpdateProductReqBody) => request.patch(`/products/${id}`, body),
  deleteProduct: (id: string) => request.delete(`/products/${id}`)
}

export default productApiRequest
