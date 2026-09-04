import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupportSettings, updateSupportSettings } from '../api/supportSettings'

export function useSupportSettings() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['support-settings'],
    queryFn: getSupportSettings,
    staleTime: 300000,
  })
  const updateMutation = useMutation({
    mutationFn: updateSupportSettings,
    onSuccess: (data) => queryClient.setQueryData(['support-settings'], data),
  })

  return {
    settings: settingsQuery.data ?? {},
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
