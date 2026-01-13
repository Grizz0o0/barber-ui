import cartApiRequest from '@/apiRequests/cart'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApiRequest.getCart()
  })
}

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { product: string; quantity: number }) => cartApiRequest.addToCart(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export const useUpdateCartQuantityMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { product: string; quantity: number }) => cartApiRequest.updateQuantity(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => cartApiRequest.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export const useClearCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cartApiRequest.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}
