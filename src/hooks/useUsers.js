import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, deleteUser, getUsers, updateUser } from '../api/users'

export function useUsers() {
  const queryClient = useQueryClient()
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const data = usersQuery.data
  const users = Array.isArray(data) ? data : data?.data ?? []

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: invalidateUsers,
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: invalidateUsers,
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: invalidateUsers,
  })

  return {
    users,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    createUserError: createUserMutation.error,
    updateUserError: updateUserMutation.error,
    deleteUserError: deleteUserMutation.error,
  }
}
