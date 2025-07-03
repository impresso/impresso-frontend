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
