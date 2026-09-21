import { SpecialMembershipRequestStatuses } from '@/constants'

/**
 * Every route of the institutions-access app. The app is served from a single
 * HTML shell (`institutions-access/index.html`), so these are all client side
 * routes resolved by vue-router.
 */
export const Routes = {
  index: {
    path: '/',
    name: 'Index'
  },
  pendingRequests: {
    path: '/pending-requests',
    name: 'PendingRequests'
  },
  temporaryRequests: {
    path: '/temporary-requests',
    name: 'TemporaryRequests'
  },
  approvedRequests: {
    path: '/approved-requests',
    name: 'ApprovedRequests'
  },
  rejectedRequests: {
    path: '/rejected-requests',
    name: 'RejectedRequests'
  },
  revokedRequests: {
    path: '/revoked-requests',
    name: 'RevokedRequests'
  },
  emailTemplates: {
    path: '/email-templates',
    name: 'EmailTemplates'
  }
} as const

/**
 * The status filter applied to the requests list. `all` is the unfiltered view.
 */
export type RequestStatusFilter = (typeof SpecialMembershipRequestStatuses)[number] | 'all'

/**
 * Maps every filterable status to the route rendering it. Each entry is
 * `[status, path, routeName]`. This is the single source of truth for the
 * status filter: the router, the status tabs and the status/route lookup are
 * all derived from it, so a new status only has to be added here.
 *
 * `pending-t` is deliberately absent. It is a transitional status the backend
 * sets while a temporary grant is awaiting full review, and it has never had a
 * filter of its own; those requests show up under `all`.
 */
export const RoutesByRequestStatus = [
  ['all', Routes.index.path, Routes.index.name],
  ['pending', Routes.pendingRequests.path, Routes.pendingRequests.name],
  ['temporary', Routes.temporaryRequests.path, Routes.temporaryRequests.name],
  ['approved', Routes.approvedRequests.path, Routes.approvedRequests.name],
  ['rejected', Routes.rejectedRequests.path, Routes.rejectedRequests.name],
  ['revoked', Routes.revokedRequests.path, Routes.revokedRequests.name]
] as const satisfies readonly (readonly [RequestStatusFilter, string, string])[]

/**
 * All statuses the requests list can be filtered by, in display order.
 */
export const RequestStatusFilters = RoutesByRequestStatus.map(
  ([status]) => status
) as RequestStatusFilter[]

/**
 * Derived lookup from a status to the route that displays it. Derived rather
 * than hand written so that it can never fall out of sync with the router.
 */
export const RouteNameByRequestStatus = Object.fromEntries(
  RoutesByRequestStatus.map(entry => [entry[0], entry[2]])
) as Record<RequestStatusFilter, string>
