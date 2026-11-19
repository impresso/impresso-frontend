import type {
  SpecialMembershipAccessMetadata,
  SpecialMembershipAccessModality
} from '@/services/types'

/** Keys the special-membership-plans patch endpoint accepts on `metadata`. */
export const PatchableMetadataKeys = [
  'modality',
  'enableTemporaryAutomaticApproval',
  'revokeAfterDays',
  'revokeTemporaryAutomaticApprovalAfterDays',
  'emailExtraMessageHtml',
  'emailExtraMessageText'
] as const satisfies readonly (keyof SpecialMembershipAccessMetadata)[]

export type PatchableSpecialMembershipAccessMetadata = Pick<
  SpecialMembershipAccessMetadata,
  (typeof PatchableMetadataKeys)[number]
>

export const isTemporaryAutomaticApprovalEnabled = (
  metadata?: SpecialMembershipAccessMetadata | null
): boolean =>
  metadata?.enableTemporaryAutomaticApproval === true ||
  metadata?.enableTemporaryAutomaticAcceptance === true

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const container = document.createElement('div')
  container.innerHTML = html
  return (container.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

const asModality = (value: unknown): SpecialMembershipAccessModality | undefined =>
  value === 'cc_reviewer' || value === 'notify_reviewer' ? value : undefined

const asNullableInteger = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

/**
 * Normalise a stored metadata blob into the patchable shape, including the
 * older `enableTemporaryAutomaticAcceptance` flag some records still carry.
 */
export const toPatchableMetadata = (
  metadata?: SpecialMembershipAccessMetadata | null
): PatchableSpecialMembershipAccessMetadata => ({
  modality: asModality(metadata?.modality) ?? 'cc_reviewer',
  enableTemporaryAutomaticApproval: isTemporaryAutomaticApprovalEnabled(metadata),
  revokeAfterDays: asNullableInteger(metadata?.revokeAfterDays),
  revokeTemporaryAutomaticApprovalAfterDays: asNullableInteger(
    metadata?.revokeTemporaryAutomaticApprovalAfterDays
  ),
  emailExtraMessageHtml: metadata?.emailExtraMessageHtml ?? null,
  emailExtraMessageText: metadata?.emailExtraMessageText ?? null
})

export const applyEmailExtraMessage = (
  metadata: PatchableSpecialMembershipAccessMetadata,
  { body, enabled }: { body: string; enabled: boolean }
): PatchableSpecialMembershipAccessMetadata => ({
  ...metadata,
  emailExtraMessageHtml: enabled ? body : null,
  emailExtraMessageText: enabled ? htmlToPlainText(body) || body : null
})
