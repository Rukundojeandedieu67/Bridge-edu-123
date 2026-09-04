import apiClient from './client'

export const getAds = async (manage = false) => {
  const response = await apiClient.get(manage ? '/ads/manage' : '/ads')
  return response.data
}

export const createAd = async (data) => (await apiClient.post('/ads', data)).data
export const updateAd = async (id, data) => (await apiClient.put(`/ads/${id}`, data)).data
export const deleteAd = async (id) => (await apiClient.delete(`/ads/${id}`)).data