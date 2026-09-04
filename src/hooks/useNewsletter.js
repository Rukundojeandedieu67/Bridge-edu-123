import { useMutation } from '@tanstack/react-query'
import { subscribeToNewsletter } from '../api/newsletter.js'

export function useNewsletter() {
  const mutation = useMutation({ mutationFn: subscribeToNewsletter })

  return {
    subscribe: mutation.mutateAsync,
    isSubscribing: mutation.isPending,
  }
}
