import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'bridgeedu-auth-state'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const persistAuthState = (nextToken, nextUser) => {
    const nextState = { token: nextToken, user: nextUser }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState))
    setToken(nextToken)
    setUser(nextUser)
  }

  const clearAuthState = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setToken('')
    setUser(null)
  }

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const rawState = window.localStorage.getItem(AUTH_STORAGE_KEY)

        if (!rawState) {
          setIsLoading(false)
          return
        }

        const parsedState = JSON.parse(rawState)

        if (!parsedState?.token) {
          clearAuthState()
          setIsLoading(false)
          return
        }

        setToken(parsedState.token)
        setUser(parsedState.user)

        const response = await apiClient.get('/auth/me')
        const nextUser = response?.data?.user ?? response?.data

        persistAuthState(parsedState.token, nextUser)
      } catch {
        clearAuthState()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    const payload = response.data

    persistAuthState(payload.token, payload.user)
    return payload
  }

  const register = async (payload) => {
    const response = await apiClient.post('/auth/register', payload)
    const registrationData = response.data

    persistAuthState(registrationData.token, registrationData.user)
    return registrationData
  }

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout')
      }
    } finally {
      clearAuthState()
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
      isLoading,
    }),
    [token, user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
