import apiClient from './client'

export const getEnrollment = async (pathwayId) => {
  const response = await apiClient.get(`/pathways/${pathwayId}/enrollment`)
  return response.data
}

export const enrollInCourse = async (pathwayId) => {
  const response = await apiClient.post(`/pathways/${pathwayId}/enrollment`)
  return response.data
}

export const completeCourseStep = async (pathwayId, stepId) => {
  const response = await apiClient.post(`/pathways/${pathwayId}/completion`, { step_id: stepId })
  return response.data
}