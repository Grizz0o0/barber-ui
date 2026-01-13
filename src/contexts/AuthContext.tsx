import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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
  const [user, setUser] = useState<User | null>(null)

  const queryClient = useQueryClient()
  const { data: userData, refetch, isLoading: isQueryLoading, isError } = useAccountMe()

  // Derive loading state: strictly true only if we have a token AND query is loading
  const token = getAccessToken()
  // Note: isQueryLoading from useQuery might be true initially if enabled=true.
  // If enabled=false (no token), isQueryLoading is false in v4, but in v5 depends on status.
  // Assuming standard behavior: if no token, we are not loading.
  const isLoading = !!token && isQueryLoading

  useEffect(() => {
    if (userData) {
      // internal structure of response might be .data or .metadata or direct
      const userPayload = userData.data?.user || userData.metadata?.user || userData.data || userData.metadata
      setUser(userPayload)
    } else if (isError) {
      setUser(null)
      // Optional: clear invalid tokens?
      // clearTokens()
    }
  }, [userData, isError])

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
      setUser(null)
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
