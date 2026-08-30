import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useApi<T>(key: string[], path: string | null) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api.get<T>(path!),
    enabled: !!path,
  });
}

export function useApiMutation<T>(path: string, method: 'post' | 'patch' | 'delete', invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation<T, Error, any>({
    mutationFn: (data) => (method === 'delete' ? api.delete<T>(`${path}${data?.id ?? ''}`) : (api as any)[method](`${path}${data?.id ?? ''}`, data)),
    onSuccess: () => invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
