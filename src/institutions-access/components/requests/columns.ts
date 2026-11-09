/**
 * Single source of truth for the review queue columns.
 *
 * Header and row share the same CSS grid template so the two cannot drift.
 * Below `lg` the header is hidden and each cell labels itself.
 */
export interface RequestsColumn {
  id: 'requester' | 'access' | 'dates' | 'status' | 'actions'
  /** Translation key, resolved against the `RequestsTable` i18n block. */
  labelKey: string
}

export const RequestsColumns: readonly RequestsColumn[] = [
  { id: 'requester', labelKey: 'columns.requester' },
  { id: 'access', labelKey: 'columns.access' },
  { id: 'dates', labelKey: 'columns.dates' },
  { id: 'status', labelKey: 'columns.status' },
  { id: 'actions', labelKey: 'columns.actions' }
] as const
