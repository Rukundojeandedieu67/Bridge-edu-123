import apiClient from './client'

export const getApplications = async (params = {}) => {
  const response = await apiClient.get('/opportunity-applications', { params })
  return response.data
}

export const createApplication = async (data) => {
  const response = await apiClient.post('/opportunity-applications', data)
  return response.data
}

export const updateApplication = async (id, data) => {
  const response = await apiClient.put(`/opportunity-applications/${id}`, data)
  return response.data
}

export const deleteApplication = async (id) => {
  const response = await apiClient.delete(`/opportunity-applications/${id}`)
  return response.data
}
