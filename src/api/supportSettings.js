import apiClient from './client'

export const getSupportSettings = async () => {
  const response = await apiClient.get('/support-settings')
  return response.data
}

export const updateSupportSettings = async (data) => {
  const response = await apiClient.put('/support-settings', data)
  return response.data
}
