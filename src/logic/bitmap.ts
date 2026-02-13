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

  // 1. Convert Base64 to a Hex string
  // Node.js: Buffer.from(input, 'base64').toString('hex')
  // Browser: Use a helper or TextEncoder
  const hexValue = Buffer.from(input, 'base64').toString('hex')

  // 2. Convert Hex to BigInt
  const value = BigInt(`0x${hexValue || '0'}`)

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
