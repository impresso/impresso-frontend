import { ref, type ComputedRef, type Ref } from 'vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import { useNotificationsStore } from '@/stores/notifications'
import type { ServiceFindParams, UserSpecialMembershipRequestReview } from '@/services/types'
import type { RequestStatusFilter } from '@/institutions-access/router/routes'

export type RequestsExportFormat = 'csv' | 'json'

/** Page size used while collecting every matching request. */
const ExportPageSize = 100
/** Safety valve so a broken `pagination.total` cannot loop forever. */
const MaxExportPages = 100

/**
 * One exported row: a request, joined with a single changelog entry. Requests
 * without any history still produce one row so nothing is silently dropped.
 */
export interface RequestLogRow {
  requestId: number
  requesterFirstname: string
  requesterLastname: string
  requesterEmail: string
  requesterAffiliation: string
  accessTitle: string
  accessProvider: string
  status: string
  dateCreated: string
  dateLastModified: string
  temporaryExpiresAt: string
  notes: string
  changelogDate: string
  changelogStatus: string
  changelogReviewer: string
  changelogNotes: string
}

const ExportColumns: (keyof RequestLogRow)[] = [
  'requestId',
  'requesterFirstname',
  'requesterLastname',
  'requesterEmail',
  'requesterAffiliation',
  'accessTitle',
  'accessProvider',
  'status',
  'dateCreated',
  'dateLastModified',
  'temporaryExpiresAt',
  'notes',
  'changelogDate',
  'changelogStatus',
  'changelogReviewer',
  'changelogNotes'
]

export const flattenRequestsToLogRows = (
  requests: UserSpecialMembershipRequestReview[]
): RequestLogRow[] =>
  requests.flatMap(request => {
    const base: Omit<
      RequestLogRow,
      'changelogDate' | 'changelogStatus' | 'changelogReviewer' | 'changelogNotes'
    > = {
      requestId: request.id,
      requesterFirstname: request.requester?.firstname ?? '',
      requesterLastname: request.requester?.lastname ?? '',
      requesterEmail: request.requester?.email ?? '',
      requesterAffiliation: request.requester?.profile?.affiliation ?? '',
      accessTitle: request.specialMembershipAccess?.title ?? '',
      accessProvider: request.specialMembershipAccess?.metadata?.provider ?? '',
      status: request.status,
      dateCreated: request.dateCreated ?? '',
      dateLastModified: request.dateLastModified ?? '',
      temporaryExpiresAt: request.temporaryExpiresAt ?? '',
      notes: request.notes ?? ''
    }

    const changelog = request.changelog ?? []
    if (changelog.length === 0) {
      return [
        {
          ...base,
          changelogDate: '',
          changelogStatus: '',
          changelogReviewer: '',
          changelogNotes: ''
        }
      ]
    }

    return changelog.map(entry => ({
      ...base,
      changelogDate: entry.date ?? '',
      changelogStatus: entry.status ?? '',
      changelogReviewer: entry.reviewer ?? '',
      changelogNotes: entry.notes ?? ''
    }))
  })

const escapeCsvValue = (value: unknown): string => {
  const asString = value === null || value === undefined ? '' : String(value)
  return `"${asString.replace(/"/g, '""')}"`
}

export const toCsv = (rows: RequestLogRow[]): string => {
  const header = ExportColumns.join(',')
  const body = rows.map(row => ExportColumns.map(column => escapeCsvValue(row[column])).join(','))
  return [header, ...body].join('\r\n')
}

const triggerDownload = (content: string, mimeType: string, filename: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export interface UseRequestsExportOptions {
  /** The active list filters, so the export matches what is on screen. */
  params: ComputedRef<ServiceFindParams>
  /** Active status filter, used in the generated file name. */
  status: ComputedRef<RequestStatusFilter> | Ref<RequestStatusFilter>
}

export interface UseRequestsExport {
  isExporting: Ref<boolean>
  exportLogs: (format: RequestsExportFormat) => Promise<void>
}

/**
 * Exports the request log for the current filters as a file.
 *
 * There is no export endpoint on the backend yet, so this collects every
 * matching page from the reviews service and builds the file in the browser.
 */
export const useRequestsExport = ({
  params,
  status
}: UseRequestsExportOptions): UseRequestsExport => {
  const notificationsStore = useNotificationsStore()
  const isExporting = ref(false)

  const fetchAllMatchingRequests = async (): Promise<UserSpecialMembershipRequestReview[]> => {
    const collected: UserSpecialMembershipRequestReview[] = []
    // Drop the on screen paging: the export always covers the full result set.
    const query = { ...(params.value.query ?? {}) }
    delete query.offset
    delete query.limit

    for (let page = 0; page < MaxExportPages; page += 1) {
      const response = await userSpecialMembershipRequestsReviewsService.find({
        query: { ...query, limit: ExportPageSize, offset: page * ExportPageSize }
      })
      const data = (response?.data ?? []) as UserSpecialMembershipRequestReview[]
      collected.push(...data)

      const total = response?.pagination?.total
      if (data.length === 0) break
      if (typeof total === 'number' && collected.length >= total) break
      if (data.length < ExportPageSize) break
    }

    return collected
  }

  const exportLogs = async (format: RequestsExportFormat) => {
    if (isExporting.value) return
    isExporting.value = true
    try {
      const requests = await fetchAllMatchingRequests()
      const rows = flattenRequestsToLogRows(requests)

      if (rows.length === 0) {
        notificationsStore.addNotification({
          type: 'info',
          title: 'Nothing to export',
          message: 'No requests match the current filters.'
        })
        return
      }

      const datePart = new Date().toISOString().slice(0, 10)
      const filename = `impresso-access-requests-${status.value}-${datePart}.${format}`

      if (format === 'csv') {
        // The BOM keeps accented requester names readable when opened in Excel.
        triggerDownload(`\uFEFF${toCsv(rows)}`, 'text/csv', filename)
      } else {
        triggerDownload(JSON.stringify(rows, null, 2), 'application/json', filename)
      }

      notificationsStore.addNotification({
        type: 'success',
        title: 'Export ready',
        message: `Exported ${rows.length} log entries from ${requests.length} requests.`
      })
    } catch (error) {
      console.error('[useRequestsExport] Failed to export request logs', error)
      notificationsStore.addNotification({
        type: 'error',
        title: 'Export failed',
        message: 'The request logs could not be exported. Please try again.'
      })
    } finally {
      isExporting.value = false
    }
  }

  return { isExporting, exportLogs }
}
