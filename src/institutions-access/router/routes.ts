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
  }
} as const

export const RoutesByRequestStatus = [
  ['all', Routes.index.path, Routes.index.name],
  ['pending', Routes.pendingRequests.path, Routes.pendingRequests.name],
  ['temporary', Routes.temporaryRequests.path, Routes.temporaryRequests.name],
  ['approved', Routes.approvedRequests.path, Routes.approvedRequests.name],
  ['rejected', Routes.rejectedRequests.path, Routes.rejectedRequests.name],
  ['revoked', Routes.revokedRequests.path, Routes.revokedRequests.name]
] as const
