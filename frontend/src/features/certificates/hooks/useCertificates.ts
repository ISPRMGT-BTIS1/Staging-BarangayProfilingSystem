import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CertificateRequest } from '../types/certificate.types'

export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  byResident: (residentId: string) => [...certificateKeys.all, 'resident', residentId] as const,
  detail: (id: string) => [...certificateKeys.all, 'detail', id] as const,
}

/**
 * Fetches all certificate requests.
 * TODO: Replace queryFn with certificatesService.getAll().then(r => r.data.data)
 */
export function useCertificates() {
  return useQuery<CertificateRequest[]>({
    queryKey: certificateKeys.lists(),
    queryFn: async (): Promise<CertificateRequest[]> => {
      // Returns empty array until API is connected
      return []
    },
  })
}

/**
 * Fetches certificate requests for a specific resident.
 */
export function useResidentCertificates(residentId: string) {
  return useQuery<CertificateRequest[]>({
    queryKey: certificateKeys.byResident(residentId),
    queryFn: async (): Promise<CertificateRequest[]> => {
      // TODO: certificatesService.getByResident(residentId).then(r => r.data.data)
      return []
    },
    enabled: Boolean(residentId),
  })
}
