import accountApiRequest from '@/apiRequests/account'
import { getAccessToken } from '@/lib/api'
import type { PaginationParamsInputType } from '@/lib/schemas/user.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAccountMe = () => {
  const accessToken = getAccessToken()
  return useQuery({
    queryKey: ['account-me'],
    queryFn: accountApiRequest.me,
    enabled: !!accessToken
  })
}

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-me'] })
    }
  })
}

export const useGetGuestList = (params: PaginationParamsInputType) => {
  const accessToken = getAccessToken()
  return useQuery({
    queryKey: ['guest-list', params],
    queryFn: () => accountApiRequest.getListUser(params),
    enabled: !!accessToken
  })
}

export const useGetUsers = (params: PaginationParamsInputType) => {
  const accessToken = getAccessToken()
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => accountApiRequest.getListUser(params),
    enabled: !!accessToken
  })
}

export const useGetBarbers = () => {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: accountApiRequest.getBarbers
  })
}

export const useGetUser = (id: string) => {
  const accessToken = getAccessToken()
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => accountApiRequest.getUser(id),
    enabled: !!accessToken && !!id
  })
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list'] })
    }
  })
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => accountApiRequest.updateUser(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['guest-list'] })
    }
  })
}

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list'] })
    }
  })
}
