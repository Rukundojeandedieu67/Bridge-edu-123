import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPathway,
  createStep,
  deletePathway,
  deleteStep,
  getPathways,
  updatePathway,
  updateStep,
} from '../api/pathways'

export function usePathways() {
  const queryClient = useQueryClient()

  const pathwaysQuery = useQuery({
    queryKey: ['pathways'],
    queryFn: getPathways,
  })

  const invalidatePathways = async () => {
    await queryClient.invalidateQueries({ queryKey: ['pathways'] })
  }

  const createPathwayMutation = useMutation({
    mutationFn: createPathway,
    onSuccess: invalidatePathways,
  })

  const updatePathwayMutation = useMutation({
    mutationFn: ({ id, data }) => updatePathway(id, data),
    onSuccess: invalidatePathways,
  })

  const deletePathwayMutation = useMutation({
    mutationFn: deletePathway,
    onSuccess: invalidatePathways,
  })

  const createStepMutation = useMutation({
    mutationFn: ({ pathwayId, data }) => createStep(pathwayId, data),
    onSuccess: invalidatePathways,
  })

  const updateStepMutation = useMutation({
    mutationFn: ({ pathwayId, stepId, data }) => updateStep(pathwayId, stepId, data),
    onSuccess: invalidatePathways,
  })

  const deleteStepMutation = useMutation({
    mutationFn: ({ pathwayId, stepId }) => deleteStep(pathwayId, stepId),
    onSuccess: invalidatePathways,
  })

  return {
    pathways: pathwaysQuery.data,
    isLoading: pathwaysQuery.isLoading,
    isError: pathwaysQuery.isError,
    error: pathwaysQuery.error,
    createPathway: createPathwayMutation.mutateAsync,
    updatePathway: updatePathwayMutation.mutateAsync,
    deletePathway: deletePathwayMutation.mutateAsync,
    createStep: createStepMutation.mutateAsync,
    updateStep: updateStepMutation.mutateAsync,
    deleteStep: deleteStepMutation.mutateAsync,
    isFetching: pathwaysQuery.isFetching,
  }
}
