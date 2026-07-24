import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from '../api/applications'

export function useOpportunityApplications() {
  const queryClient = useQueryClient()

  const applicationsQuery = useQuery({
    queryKey: ['opportunity-applications'],
    queryFn: () => getApplications(),
  })

  const invalidateApplications = async () => {
    await queryClient.invalidateQueries({ queryKey: ['opportunity-applications'] })
  }

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: invalidateApplications,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateApplication(id, data),
    onSuccess: invalidateApplications,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: invalidateApplications,
  })

  const applicationsPayload = applicationsQuery.data ?? {}
  const applications = Array.isArray(applicationsPayload.data)
    ? applicationsPayload.data
    : Array.isArray(applicationsPayload)
      ? applicationsPayload
      : []

  return {
    applications,
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    createApplication: createMutation.mutateAsync,
    updateApplication: updateMutation.mutateAsync,
    deleteApplication: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
