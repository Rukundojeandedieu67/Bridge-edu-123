import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/users'

export function useUsers() {
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const data = usersQuery.data
  const users = Array.isArray(data) ? data : data?.data ?? []

  return {
    users,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
  }
}
