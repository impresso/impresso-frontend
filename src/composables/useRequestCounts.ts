import { ref, watch, type ComputedRef, type Ref } from 'vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import {
  RequestStatusFilters,
  type RequestStatusFilter
} from '@/institutions-access/router/routes'

export type RequestCounts = Partial<Record<RequestStatusFilter, number>>

export interface UseRequestCountsOptions {
  /**
   * Optional search term so that the counts describe the same result set the
   * reviewer is currently looking at.
   */
  term?: Ref<string> | ComputedRef<string>
}

export interface UseRequestCounts {
  counts: Ref<RequestCounts>
  isLoading: Ref<boolean>
  refresh: () => Promise<void>
}

/**
 * Loads the total number of requests per status so the status tabs can show a
 * queue size. The reviews service has no dedicated counts endpoint, so this
 * asks for a single item per status and reads `pagination.total`.
 */
export const useRequestCounts = ({ term }: UseRequestCountsOptions = {}): UseRequestCounts => {
  const counts = ref<RequestCounts>({})
  const isLoading = ref(false)

  const fetchCount = async (status: RequestStatusFilter): Promise<number | undefined> => {
    const query: Record<string, unknown> = { limit: 1, offset: 0 }
    if (status !== 'all') query.status = [status]
    if (term?.value) query.term = term.value

    try {
      const { pagination } = await userSpecialMembershipRequestsReviewsService.find({ query })
      return pagination?.total
    } catch (error) {
      console.warn('[useRequestCounts] Failed to load count for status', status, error)
      return undefined
    }
  }

  const refresh = async () => {
    isLoading.value = true
    try {
      const results = await Promise.all(
        RequestStatusFilters.map(async status => [status, await fetchCount(status)] as const)
      )
      counts.value = results.reduce<RequestCounts>((acc, [status, total]) => {
        if (total !== undefined) acc[status] = total
        return acc
      }, {})
    } finally {
      isLoading.value = false
    }
  }

  watch(() => term?.value, refresh, { immediate: true })

  return { counts, isLoading, refresh }
}
