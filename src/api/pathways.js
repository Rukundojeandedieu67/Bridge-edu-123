import apiClient from './client'

export const getPathways = async () => {
  const response = await apiClient.get('/pathways')
  return response.data
}

export const createPathway = async (data) => {
  const response = await apiClient.post('/pathways', data)
  return response.data
}

export const updatePathway = async (id, data) => {
  const response = await apiClient.put(`/pathways/${id}`, data)
  return response.data
}

export const deletePathway = async (id) => {
  const response = await apiClient.delete(`/pathways/${id}`)
  return response.data
}

export const createStep = async (pathwayId, data) => {
  const response = await apiClient.post(`/pathways/${pathwayId}/steps`, data)
  return response.data
}

export const updateStep = async (pathwayId, stepId, data) => {
  const response = await apiClient.put(`/pathways/${pathwayId}/steps/${stepId}`, data)
  return response.data
}

export const deleteStep = async (pathwayId, stepId) => {
  const response = await apiClient.delete(`/pathways/${pathwayId}/steps/${stepId}`)
  return response.data
}
