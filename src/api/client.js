import axios from 'axios'

const AUTH_STORAGE_KEY = 'bridgeedu-auth-state'

const apiClient = axios.create({
  // baseURL: 'http://localhost:8000/api/v1',
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawState = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawState) {
    return null
  }

  try {
    return JSON.parse(rawState)
  } catch {
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  const authState = getStoredAuth()
  const token = authState?.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)

export default apiClient
