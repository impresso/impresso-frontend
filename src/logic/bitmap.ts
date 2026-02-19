import { PlanBigints, PlanLabels } from '@/constants'
import { base64BytesToBigInt } from '@/util/bigint'

export type DecodedBitmap = {
  bigint: bigint
  hex: string
  binary: string
}
/**
 * Decodes a BASE64 bitmap into its BigInt, Hex, and Binary formats.
 * @param input - Base64 encoded string
 */
export const decodeBase64Bitmap = (input: string): DecodedBitmap => {
  // Guard for empty or invalid input
  if (!input || typeof input !== 'string') {
    return { bigint: 0n, hex: '0x0', binary: '0' }
  }

  // Use existing utility to convert Base64 to BigInt
  const value = base64BytesToBigInt(input)

  return {
    bigint: value,
    hex: `0x${value.toString(16).toUpperCase()}`,
    binary: value.toString(2)
  }
}

/**
 * Check if a bitmap has any special membership access (i.e., is >= PlanResearcher).
 * @param bitmap
 * @returns true if the bitmap grants access to any special membership, false otherwise
 */
export const hasAnySpecialMembershipAccess = (bitmap: string): boolean => {
  const parseBitmapResult = decodeBase64Bitmap(bitmap)
  const minBigIntValue = 8n // corresponds to the highest plan bigint value (PlanResearcher)
  if (parseBitmapResult.bigint >= minBigIntValue) {
    console.debug(`[bitmap.ts] hasAnySpecialMembershipAccess`, parseBitmapResult)
    return true
  }
  console.debug(`[bitmap.ts] no specialMembershipAccess`, parseBitmapResult)
  return false
}

/**
 * Given a decoded bitmap, returns a list of all plans that are able to access based on the bitmap's bigint value.
 * @param decodedBitmap The decoded bitmap to check against available plans
 * @return An array of plan names that the bitmap grants access to
 */
export const getPlansFromDecodedBitmap = (decodedBitmap: DecodedBitmap): string[] => {
  return Object.entries(PlanBigints)
    .filter(([_planName, planBigint]) => {
      return (decodedBitmap.bigint & planBigint) !== 0n
    })
    .map(([planName, _]) => PlanLabels[planName])
}
