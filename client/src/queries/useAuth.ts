import { useMutation, useQuery } from '@tanstack/vue-query'

import { useTRPC } from '@/composables/useTRPC'
export const useGithubStart = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['githubStart'],
    mutationFn: () => trpc.auth.github.githubStart.mutate({}),
    retry: false,
  })
}
export const useGithubCallback = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['githubCallback'],
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      trpc.auth.github.githubCallback.mutate({ code, state }),
    // onSuccess: ({ ap }) => (window.location.href = redirectUrl),
    retry: false,
  })
}
export const useGoogleStart = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['googleStart'],
    mutationFn: () => trpc.auth.google.googleStart.mutate({}),
    retry: false,
  })
}
export const useGoogleCallback = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['googleCallback'],
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      trpc.auth.google.googleCallback.mutate({ code, state }),
    // onSuccess: ({ ap }) => (window.location.href = redirectUrl),
    retry: false,
  })
}

export const useMeQuery = (options = {}) => {
  const trpc = useTRPC()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => trpc.auth.user.me.query({}),
    ...options,
  })
}

export const useLogout = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['logout'],
    mutationFn: () => trpc.auth.user.logout.mutate({}),
  })
}
export const useGenerateKey = () => {
  const trpc = useTRPC()
  return useMutation({
    mutationKey: ['generateKey'],
    mutationFn: () => trpc.auth.user.generateMyKey.mutate({}),
  })
}
