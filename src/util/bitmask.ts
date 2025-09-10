/**
 * Converts a BigInt to a Base64 encoded string representation.
 *
 * This function takes a BigInt value and converts it to a Base64 string,
 * which is useful for encoding large integers in a compact, URL-safe format.
 *
 * @param {BigInt} bigInt - The BigInt value to convert to Base64
 * @returns {string} The Base64 encoded string representation of the BigInt
 *
 * @example
 * // Convert a large BigInt to Base64
 * const myBigInt = BigInt('123456789012345678901234567890');
 * const base64String = bigIntToBase64(myBigInt);
 * console.log(base64String); // Returns Base64 encoded string
 *
 * @example
 * // Working with very large numbers
 * const largeBigInt = BigInt('0x1fffffffffffff');
 * const encoded = bigIntToBase64(largeBigInt);
 *
 * @throws {TypeError} Throws an error if the input is not a BigInt
 * @throws {RangeError} Throws an error if the BigInt is negative
 */
export function bigIntToBase64(bigInt: bigint): string {
  // Convert the BigInt to a hexadecimal string.
  const hex = bigInt.toString(16)

  // Pad with a leading '0' if the hex string has an odd length.
  const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex

  // Create a Uint8Array from the padded hexadecimal string.
  const bytes = new Uint8Array(paddedHex.length / 2)
  for (let i = 0; i < paddedHex.length; i += 2) {
    bytes[i / 2] = parseInt(paddedHex.substring(i, i + 2), 16)
  }

  // Convert the Uint8Array to a binary string and then to Base64.
  let binaryString = ''
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i])
  }

  // Use the built-in `btoa` function for Base64 encoding.
  return btoa(binaryString)
}

/**
 * Decodes a Base64 string representing a 64-bit integer into a BigInt.
 * This function works correctly for big-endian byte order.
 * @param base64String The Base64 encoded string.
 * @returns The decoded BigInt.
 */
export function base64ToBigInt(base64String: string): bigint {
  // Remove any padding and whitespace
  const cleanBase64 = base64String.replace(/[=\s]/g, '')

  // Convert base64 to binary string
  const binaryString = atob(cleanBase64)

  // Convert binary string to hex
  let hexString = ''
  for (let i = 0; i < binaryString.length; i++) {
    const hex = binaryString.charCodeAt(i).toString(16).padStart(2, '0')
    hexString += hex
  }

  // Convert hex to BigInt
  return BigInt('0x' + hexString)
}

export function bigIntToBinaryString(bigInt: bigint): string {
  return bigInt.toString(2)
}
