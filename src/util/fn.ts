export function includes<T extends U, U>(arr: ReadonlyArray<T>, val: U): val is T {
  return (arr as ReadonlyArray<U>).includes(val)
}

/**
 * Truncate `text` to at most `maxWords` words. If any words are dropped, an
 * ellipsis is appended. A non-positive `maxWords` leaves the text untouched.
 */
export const truncateToWords = (text: string, maxWords?: number, ellipsis = '…'): string => {
  if (!maxWords || maxWords <= 0) return text
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return `${words.slice(0, maxWords).join(' ')}${ellipsis}`
}

export const groupBy = <T>(array: T[], key: (item: T) => string | number) => {
  return array.reduce(
    (acc, item) => {
      const groupKey = key(item)
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string | number, T[]>
  )
}
