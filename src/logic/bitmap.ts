import { base64BytesToBigInt } from '@/util/bigint'

/**
 * Decodes a BASE64 bitmap into its BigInt, Hex, and Binary formats.
 * @param input - Base64 encoded string
 */
export const decodeBase64Bitmap = (
  input: string
): {
  bigint: bigint
  hex: string
  binary: string
} => {
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

export const hasAnySpecialMembershipAccess = (bitmap: string): boolean => {
  const parseBitmapResult = decodeBase64Bitmap(bitmap)

  console.debug(`[bitmap.ts] hasAnySpecialMembershipAccess`, parseBitmapResult)
  return false
}
