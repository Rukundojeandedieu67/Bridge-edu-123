import apiClient from './client'

export const getLessonEvaluation = async (stepId) => {
  const response = await apiClient.get(`/learning/steps/${stepId}/evaluation`)
  return response.data
}

export const saveLearningNote = async (data) => {
  const response = await apiClient.post('/learning/notes', data)
  return response.data
}

export const getLearningNotes = async (stepId) => {
  const response = await apiClient.get(`/learning/notes?pathway_step_id=${stepId}`)
  return response.data
}

export const submitLessonEvaluation = async (stepId, answers) => {
  const response = await apiClient.post(`/learning/steps/${stepId}/evaluation/submit`, { answers })
  return response.data
}

export const createLessonEvaluation = async (stepId, data) => {
  const response = await apiClient.post(`/pathway-steps/${stepId}/evaluations`, data)
  return response.data
}

export const getAdminLessonEvaluation = async (stepId) => {
  const response = await apiClient.get(`/pathway-steps/${stepId}/evaluations/manage`)
  return response.data
}

export const updateLessonEvaluation = async (evaluationId, data) => {
  const response = await apiClient.patch(`/pathway-evaluations/${evaluationId}`, data)
  return response.data
}
