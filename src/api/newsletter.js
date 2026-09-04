import apiClient from './client'

export const subscribeToNewsletter = async (email) => {
  const response = await apiClient.post('/newsletter/subscribe', { email })
  return response.data
}
