import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMentorshipRequest,
  getMentors,
  getMentorshipRequests,
  updateMentorshipRequest as updateMentorshipRequestApi,
} from '../api/mentorship'

export function useMentorship() {
  const queryClient = useQueryClient()

  const mentorsQuery = useQuery({
    queryKey: ['mentors'],
    queryFn: getMentors,
  })

  const requestsQuery = useQuery({
    queryKey: ['mentorship-requests'],
    queryFn: getMentorshipRequests,
  })

  const createMutation = useMutation({
    mutationFn: createMentorshipRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMentorshipRequestApi(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] })
    },
  })

  const updateMentorshipRequest = (idOrPayload, maybeData) => {
    const variables =
      typeof idOrPayload === 'object' && idOrPayload !== null && 'id' in idOrPayload
        ? { id: idOrPayload.id, data: idOrPayload.data }
        : { id: idOrPayload, data: maybeData }

    return updateMutation.mutateAsync(variables)
  }

  const mentors = Array.isArray(mentorsQuery.data)
    ? mentorsQuery.data
    : mentorsQuery.data?.data ?? []

  const requestsPayload = requestsQuery.data ?? {}
  const mentorshipRequests = Array.isArray(requestsPayload.data)
    ? requestsPayload.data
    : Array.isArray(requestsPayload)
      ? requestsPayload
      : []

  return {
    mentors,
    mentorshipRequests,
    isLoadingMentors: mentorsQuery.isLoading,
    isLoadingRequests: requestsQuery.isLoading,
    isErrorMentors: mentorsQuery.isError,
    isErrorRequests: requestsQuery.isError,
    mentorsError: mentorsQuery.error,
    requestsError: requestsQuery.error,
    createMentorshipRequest: createMutation.mutateAsync,
    updateMentorshipRequest,
    isCreatingRequest: createMutation.isPending,
    isUpdatingRequest: updateMutation.isPending,
  }
}
