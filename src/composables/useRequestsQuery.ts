import { computed, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ServiceFindParams } from '@/services/types'
import type { RequestStatusFilter } from '@/institutions-access/router/routes'

export const RequestsOrderByOptions = ['-dateLastModified', 'dateLastModified'] as const

export type RequestsOrderBy = (typeof RequestsOrderByOptions)[number]

const DefaultOrderBy: RequestsOrderBy = '-dateLastModified'
const DefaultLimit = 25

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
  /** Page size, mirrored in `?limit=`. */
  limit: ComputedRef<number>
  /**
   * Result offset, mirrored in `?offset=`. This seeds the first load of the
   * list, which then owns paging internally.
   */
  offset: ComputedRef<number>
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

const readNumber = (value: unknown, fallback: number): number => {
  const parsed = parseInt(readString(value), 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/**
 * Keeps the requests list filters in the URL query string so that a filtered
 * queue can be bookmarked, reloaded or shared with another reviewer.
 *
 * The status filter is intentionally not part of the query string: every status
 * has its own route, which keeps those URLs readable.
 */
export const useRequestsQuery = ({ status }: UseRequestsQueryOptions): UseRequestsQuery => {
  const route = useRoute()
  const router = useRouter()

  const term = computed(() => readString(route.query.q).trim())

  const orderBy = computed<RequestsOrderBy>(() => {
    const value = readString(route.query.orderBy) as RequestsOrderBy
    return RequestsOrderByOptions.includes(value) ? value : DefaultOrderBy
  })

  const limit = computed(() => readNumber(route.query.limit, DefaultLimit))
  const offset = computed(() => readNumber(route.query.offset, 0))

  const hasActiveFilters = computed(() => term.value !== '' || orderBy.value !== DefaultOrderBy)

  /**
   * Replaces the given query params. Uses `replace` so that filtering does not
   * fill the browser history with intermediate states.
   */
  const updateQuery = (patch: Record<string, string | undefined>) => {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries({ ...route.query, ...patch })) {
      const asString = readString(value)
      if (asString !== '') query[key] = asString
    }
    router.replace({ query })
  }

  const setTerm = (value: string) => {
    const normalized = value.trim()
    // Any change of the result set invalidates the current page.
    updateQuery({ q: normalized || undefined, offset: undefined })
  }

  const setOrderBy = (value: RequestsOrderBy) => {
    updateQuery({ orderBy: value === DefaultOrderBy ? undefined : value, offset: undefined })
  }

  const resetFilters = () => {
    updateQuery({ q: undefined, orderBy: undefined, offset: undefined })
  }

  const serviceParams = computed<ServiceFindParams>(() => {
    const query: {
      limit: number
      offset: number
      order_by: RequestsOrderBy
      term: string
      status?: RequestStatusFilter[]
    } = {
      limit: limit.value,
      offset: offset.value,
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
    limit,
    offset,
    hasActiveFilters,
    serviceParams,
    setTerm,
    setOrderBy,
    resetFilters
  }
}
