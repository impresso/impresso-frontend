import { computed, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ServiceFindParams } from '@/services/types'
import type { RequestStatusFilter } from '@/institutions-access/router/routes'

export const RequestsOrderByOptions = ['-dateLastModified', 'dateLastModified'] as const

export type RequestsOrderBy = (typeof RequestsOrderByOptions)[number]

const DefaultOrderBy: RequestsOrderBy = '-dateLastModified'

export interface UseRequestsQueryOptions {
  /**
   * The status filter for the current route. The status comes from the route
   * itself (each status has its own path) rather than from the query string.
   */
  status: Ref<RequestStatusFilter> | ComputedRef<RequestStatusFilter>
}

export interface UseRequestsQuery {
  /** Free text search term, mirrored in `?q=`. */
  term: ComputedRef<string>
  /** Sort order, mirrored in `?orderBy=`. */
  orderBy: ComputedRef<RequestsOrderBy>
  /** Whether any filter beyond the status is active. */
  hasActiveFilters: ComputedRef<boolean>
  /** Feathers `find` params built from the current state. */
  serviceParams: ComputedRef<ServiceFindParams>
  setTerm: (term: string) => void
  setOrderBy: (orderBy: RequestsOrderBy) => void
  resetFilters: () => void
}

const readString = (value: unknown): string => {
  if (Array.isArray(value)) return readString(value[0])
  return typeof value === 'string' ? value : ''
}

/**
 * Keeps the requests list filters in the URL query string so that a filtered
 * queue can be bookmarked, reloaded or shared with another reviewer.
 *
 * The status filter is intentionally not part of the query string: every status
 * has its own route, which keeps those URLs readable.
 *
 * Paging (`limit` / `offset`) is deliberately not mirrored here. The list
 * component owns its pagination and overrides both keys on every request after
 * the first load, so these values could only ever seed the initial fetch and
 * went stale as soon as the reviewer changed page. Keeping them in the URL
 * suggested they were shareable state when nothing ever wrote them back.
 */
export const useRequestsQuery = ({ status }: UseRequestsQueryOptions): UseRequestsQuery => {
  const route = useRoute()
  const router = useRouter()

  const term = computed(() => readString(route.query.q).trim())

  const orderBy = computed<RequestsOrderBy>(() => {
    const value = readString(route.query.orderBy) as RequestsOrderBy
    return RequestsOrderByOptions.includes(value) ? value : DefaultOrderBy
  })

  const hasActiveFilters = computed(() => term.value !== '' || orderBy.value !== DefaultOrderBy)

  /**
   * Query params this composable no longer owns. They are dropped rather than
   * preserved so that links shared before the paging state moved into the list
   * (for example `?q=luc&offset=50`) do not keep carrying a page that the list
   * would now ignore.
   */
  const RemovedQueryParams = ['limit', 'offset']

  /**
   * Replaces the given query params. Uses `replace` so that filtering does not
   * fill the browser history with intermediate states.
   */
  const updateQuery = (patch: Record<string, string | undefined>) => {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries({ ...route.query, ...patch })) {
      if (RemovedQueryParams.includes(key)) continue
      const asString = readString(value)
      if (asString !== '') query[key] = asString
    }
    router.replace({ query })
  }

  const setTerm = (value: string) => {
    updateQuery({ q: value.trim() || undefined })
  }

  const setOrderBy = (value: RequestsOrderBy) => {
    updateQuery({ orderBy: value === DefaultOrderBy ? undefined : value })
  }

  const resetFilters = () => {
    updateQuery({ q: undefined, orderBy: undefined })
  }

  const serviceParams = computed<ServiceFindParams>(() => {
    // No `limit` / `offset`: the list supplies both, since it owns paging.
    const query: {
      order_by: RequestsOrderBy
      term: string
      status?: RequestStatusFilter[]
    } = {
      order_by: orderBy.value,
      term: term.value
    }

    if (status.value !== 'all') {
      query.status = [status.value]
    }

    return { query }
  })

  return {
    term,
    orderBy,
    hasActiveFilters,
    serviceParams,
    setTerm,
    setOrderBy,
    resetFilters
  }
}
