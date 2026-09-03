/**
 * Authoritative client-side guard against duplicate search-exporter creates.
 *
 * The feathers before-hook on `search-exporter.create` is the source of truth:
 * it claims the signature and skips the real server call on duplicates.
 * UI handlers may use `isDuplicateExport` (read-only) to skip a second toast.
 */

const recentExports = new Map<string, number>()

/** How long an identical export is blocked after being triggered. */
export const EXPORT_COOLDOWN_MS = 8000

function cleanup(now: number) {
  for (const [key, ts] of recentExports) {
    if (now - ts > EXPORT_COOLDOWN_MS) recentExports.delete(key)
  }
}

/**
 * Build a stable signature from the create payload + query params.
 * Same search/selection/collection → same signature.
 */
export function buildExportSignature(data: any, params: any): string {
  const filters = params?.query?.filters ?? data?.filters ?? []
  const groupBy = params?.query?.group_by ?? params?.query?.groupBy ?? ''
  const format = params?.query?.format ?? 'csv'
  const description = typeof data?.description === 'string' ? data.description : ''
  return `${groupBy}:${format}:${description}:${JSON.stringify(filters)}`
}

/** Read-only: true if an identical export was claimed within the cooldown. */
export function isDuplicateExport(signature: string, now: number = Date.now()): boolean {
  cleanup(now)
  const last = recentExports.get(signature)
  return last != null && now - last < EXPORT_COOLDOWN_MS
}

/**
 * Claim an export signature. Returns true if this call should proceed,
 * false if an identical export was just started. Only the service hook
 * should claim - UI code should use `isDuplicateExport` instead.
 */
export function claimExport(signature: string, now: number = Date.now()): boolean {
  if (isDuplicateExport(signature, now)) {
    console.warn(
      '[exportGuard] blocked duplicate search-exporter.create',
      signature.slice(0, 160),
      '\n',
      new Error('duplicate export').stack
    )
    return false
  }
  recentExports.set(signature, now)
  return true
}
