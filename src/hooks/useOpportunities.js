import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunities,
  updateOpportunity,
} from '../api/opportunities'

export function useOpportunities(filters = {}) {
  const queryClient = useQueryClient()

  const normalizedFilters = {
    category: filters.category ?? '',
    region: filters.region ?? '',
    search: filters.search ?? '',
    upcoming: filters.upcoming ?? false,
    page: filters.page ?? 1,
  }

  const requestParams = {
    page: normalizedFilters.page,
    ...(normalizedFilters.category ? { category: normalizedFilters.category } : {}),
    ...(normalizedFilters.region?.trim() ? { region: normalizedFilters.region.trim() } : {}),
    ...(normalizedFilters.search?.trim() ? { search: normalizedFilters.search.trim() } : {}),
    ...(normalizedFilters.upcoming ? { upcoming: true } : {}),
  }

  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', normalizedFilters],
    queryFn: () => getOpportunities(requestParams),
    keepPreviousData: true,
  })

  const createMutation = useMutation({
    mutationFn: createOpportunity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateOpportunity(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })

  return {
    opportunities: opportunitiesQuery.data,
    isLoading: opportunitiesQuery.isLoading,
    isFetching: opportunitiesQuery.isFetching,
    isError: opportunitiesQuery.isError,
    error: opportunitiesQuery.error,
    refetch: opportunitiesQuery.refetch,
    createOpportunity: createMutation.mutateAsync,
    updateOpportunity: updateMutation.mutateAsync,
    deleteOpportunity: deleteMutation.mutateAsync,
  }
}
