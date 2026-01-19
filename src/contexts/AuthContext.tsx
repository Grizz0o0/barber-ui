import { createContext, useContext, type ReactNode } from 'react'
import { setTokens, clearTokens, getAccessToken, setUserId } from '@/lib/api'
import authApiRequest from '@/apiRequests/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useAccountMe } from '@/queries/useAccount'

import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    confirm_password: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const { data: userData, refetch, isLoading: isQueryLoading, isError } = useAccountMe()

  const token = getAccessToken()
  const isLoading = !!token && isQueryLoading

  const user =
    !isError && userData ? userData.data?.user || userData.metadata?.user || userData.data || userData.metadata : null

  // Login
  const login = async (email: string, password: string) => {
    const response = await authApiRequest.login({ email, password })
    const data = response.data || response.metadata || response
    const accessToken = data.accessToken || data.tokens?.accessToken
    const refreshToken = data.refreshToken || data.tokens?.refreshToken
    const user = data.user

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken)
      if (user && user._id) {
        setUserId(user._id)
      }
      // Force refetch to update user state immediately
      await refetch()
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authApiRequest.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearTokens()
      queryClient.removeQueries({ queryKey: ['account-me'] })
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    confirm_password: string
    phone: string
  }) => {
    await authApiRequest.register(data)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser: async () => {
          await refetch()
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
