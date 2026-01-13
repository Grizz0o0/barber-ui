import { request } from '@/lib/api'

export const cartApiRequest = {
  addToCart: (body: { product: string; quantity: number }) => request.post('/cart/add-to-cart', body),
  getCart: () => request.get('/cart'),
  updateQuantity: (body: { product: string; quantity: number }) => request.patch('/cart/update-quantity', body),
  removeItem: (productId: string) => request.delete(`/cart/remove-item/${productId}`),
  clearCart: () => request.delete('/cart/clear')
}

export default cartApiRequest
