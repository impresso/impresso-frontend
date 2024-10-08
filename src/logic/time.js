import { utcDay, utcMonth, utcYear } from 'd3'

/**
 * @template T
 *
 * @param {T[]} items array of items
 * @param {'year' | 'month' | 'day'} interval
 * @param {(T) => Date} getDateFn function used to extract date from `T`
 * @param {(Date) => T} fillItemFn function used to generate a new `T` given date
 * @returns {T[]}
 */
export function withMissingDates(items, interval, getDateFn, fillItemFn) {
  if (typeof getDateFn !== 'function')
    throw new Error(`getDateFn is not a function: ${typeof getDateFn}`)
  if (typeof fillItemFn !== 'function')
    throw new Error(`fillItemFn is not a function: ${typeof fillItemFn}`)

  const intervalFn = {
    day: utcDay.range,
    month: utcMonth.range,
    year: utcYear.range
  }[interval]
  if (intervalFn == null) throw new Error(`Unknown interval: ${interval}`)

  const sortedItems = [...items].sort((a, b) => getDateFn(a).getTime() - getDateFn(b).getTime())

  return sortedItems.flatMap((item, index, items) => {
    if (index === 0) return item

    const previousItem = items[index - 1]
    const missingDates = intervalFn(getDateFn(previousItem), getDateFn(item), 1).slice(1)

    return missingDates.map(fillItemFn).concat([item])
  })
}
