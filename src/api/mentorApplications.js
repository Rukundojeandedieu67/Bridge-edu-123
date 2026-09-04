import apiClient from './client'

export const submitMentorApplication = async (data) => {
  const response = await apiClient.post('/mentor-applications', data)
  return response.data
}
