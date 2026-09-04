import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAd, deleteAd, getAds, updateAd } from '../api/ads.js'

export function useAds({ manage = false } = {}) {
  const queryClient = useQueryClient()
  const key = ['ads', manage]
  const query = useQuery({ queryKey: key, queryFn: () => getAds(manage) })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ads'] })
  const createMutation = useMutation({ mutationFn: createAd, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => updateAd(id, data), onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: deleteAd, onSuccess: invalidate })

  return {
    ads: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createAd: createMutation.mutateAsync,
    updateAd: updateMutation.mutateAsync,
    deleteAd: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  }
}