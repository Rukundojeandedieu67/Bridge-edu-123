import apiClient from './client'

export const getMentors = async () => {
  const response = await apiClient.get('/mentors')
  return response.data
}

export const getMentorshipRequests = async () => {
  const response = await apiClient.get('/mentorship-requests')
  return response.data
}

export const createMentorshipRequest = async (data) => {
  const response = await apiClient.post('/mentorship-requests', data)
  return response.data
}

export const updateMentorshipRequest = async (id, data) => {
  const response = await apiClient.put(`/mentorship-requests/${id}`, data)
  return response.data
}
