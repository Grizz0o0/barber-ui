import productApiRequest from '@/apiRequests/product'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateProductReqBody, UpdateProductReqBody } from '@/lib/schemas/product.schema'

export const useGetProducts = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => productApiRequest.getProducts(page, limit)
  })
}

export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApiRequest.getProduct(id),
    enabled: !!id
  })
}

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProductReqBody) => productApiRequest.createProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductReqBody }) => productApiRequest.updateProduct(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productApiRequest.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
