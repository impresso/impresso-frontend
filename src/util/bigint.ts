import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

export const bigIntToBuffer = (value: bigint): Buffer => {
  const buf = Buffer.allocUnsafe(8)
  // Write 8 bytes big-endian manually
  let v = value
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(v & 0xffn)
    v >>= 8n
  }
  return buf
}

export const bufferToBigInt = (buffer: Buffer): bigint => {
  let result = 0n
  for (const byte of buffer) {
    result = (result << 8n) | BigInt(byte)
  }
  return result
}

export const bigIntToBase64Bytes = (value: bigint): string => {
  return bigIntToBuffer(value).toString('base64')
}

export const base64BytesToBigInt = (base64: string): bigint => {
  return bufferToBigInt(Buffer.from(base64, 'base64'))
}

export const bigIntToBitString = (value: bigint): string => {
  return value.toString(2).padStart(64, '0')
}

export const bigIntToLongString = (value: bigint): string => {
  return value.toString(10)
}

export const bitStringToBigInt = (bitString: string): bigint => {
  return BigInt(`0b${bitString}`)
}

const Zero = BigInt(0)
export const bitmapsAlign = (bitmap: bigint, mask: bigint): boolean => {
  return (bitmap & mask) != Zero
}

export const OpenPermissions = BigInt('0b' + [...Array(64)].map(() => '1').join(''))
