const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3052'

// Token management
export const getAccessToken = () => localStorage.getItem('accessToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')
export const getUserId = () => localStorage.getItem('userId')

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export const setUserId = (userId: string) => {
  localStorage.setItem('userId', userId)
}

export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userId')
}

// Refresh Token State
let isRefreshing = false
interface QueueItem {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// API client
export const apiClient = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAccessToken()
  const userId = getUserId()

  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  if (userId) {
    ;(headers as Record<string, string>)['x-client-id'] = userId
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  // Handle 401 Unauthorized
  if (response.status === 401) {
    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh-token')) {
      if (endpoint.includes('/auth/refresh-token')) {
        clearTokens()
        window.location.href = '/login'
      }
      const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }))
      throw errorData
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          if (newToken) {
            ;(options.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
          }
          return apiClient(endpoint, options)
        })
        .catch((err) => Promise.reject(err))
    }

    isRefreshing = true

    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token available')

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rtoken-id': refreshToken
        }
      })

      if (!refreshRes.ok) throw new Error('Refresh token failed')

      const data = await refreshRes.json()
      const newAccessToken = data.metadata?.accessToken || data.metadata?.tokens?.accessToken
      const newRefreshToken = data.metadata?.refreshToken || data.metadata?.tokens?.refreshToken

      if (newAccessToken && newRefreshToken) {
        setTokens(newAccessToken, newRefreshToken)
        processQueue(null, newAccessToken)
        return apiClient(endpoint, options)
      } else {
        throw new Error('Invalid token structure')
      }
    } catch (error) {
      processQueue(error, null)
      clearTokens()
      window.location.href = '/login'
      throw error
    } finally {
      isRefreshing = false
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
    const error = new Error(errorData.message || 'An error occurred')
    Object.assign(error, errorData)
    throw error
  }

  return response.json()
}

// Helper methods to simplify API calls
export const request = {
  get: <T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean | (string | number | boolean)[] | undefined | null>
  ) => {
    let url = endpoint
    if (params) {
      const queryString = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryString.append(key, v.toString()))
          } else {
            queryString.append(key, value.toString())
          }
        }
      })
      const qs = queryString.toString()
      if (qs) {
        url += `?${qs}`
      }
    }
    return apiClient<T>(url, { method: 'GET' })
  },

  post: <T = any>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  patch: <T = any>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  put: <T = any>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  delete: <T = any>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' })
}
