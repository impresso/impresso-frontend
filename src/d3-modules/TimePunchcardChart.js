import * as d3 from 'd3'

const OneDayInMs = 1000 * 60 * 60 * 24 // 1 day

/** @param {Date} date */
const isExactYear = date => date.getMonth() === 0 && date.getDate() === 1
/** @param {Date} date */
const isExactMonth = date => date.getDate() === 1

const defaultColorPalette = [
  '#323232',
  '#313131',
  '#303030',
  '#2e2e2e',
  '#2d2d2d',
  '#2c2c2c',
  '#2a2a2a',
  '#292929',
  '#282828',
  '#262626',
  '#252525',
  '#242424',
  '#232323',
  '#212121',
  '#202020',
  '#1f1f1f',
  '#1e1e1e',
  '#1c1c1c',
  '#1b1b1b',
  '#1a1a1a',
  '#191919',
  '#181818',
  '#161616',
  '#151515',
  '#141414',
  '#131313',
  '#121212',
  '#101010',
  '#0f0f0f',
  '#0e0e0e',
  '#0d0d0d',
  '#0c0c0c',
].reverse()

/**
 * @param {Date[]} times
 * @returns {[
 *  d3.CountableTimeInterval,
 *  (date: Date) => string,
 *  (date: Date) => boolean
 * ]}
 */
function findTimeInterval(times) {
  const minTimeIntervalDays = times.reduce((minInterval, value, index, values) => {
    if (index === 0) return minInterval
    const previousValue = values[index - 1]
    if (previousValue.getTime() === value.getTime()) return minInterval

    const diff = Math.abs(previousValue.getTime() - value.getTime())

    if (minInterval === 0) return diff
    return diff < minInterval ? diff : minInterval
  }, 0) / OneDayInMs;

  let interval = d3.timeYear
  let format = d3.timeFormat('%Y')
  // eslint-disable-next-line no-unused-vars
  let renderLabel = date => true

  if (minTimeIntervalDays < 365 && minTimeIntervalDays > 1) {
    interval = d3.timeMonth
    format = d3.timeFormat('%b %Y')
    renderLabel = isExactYear
  } else if (minTimeIntervalDays <= 1) {
    interval = d3.timeDay
    format = d3.timeFormat('%H %b %Y')
    renderLabel = isExactMonth
  }

  return [interval, format, renderLabel]
}

/**
 * @typedef {{ time: string | Date, value: number }} DataPoint
 * @typedef {{ label?: string, dataPoints: DataPoint[], isSubcategory?: boolean }} ChartCategory
 * @typedef {{ categories: ChartCategory[] }} ChartData
 */

export default class TimePunchcardChart {
  constructor({
    element = null,
    margin = { top: 5, bottom: 15, left: 20, right: 10, categoryTop: 40, sizer: 3, subCategoryLeft : 8, gutterHeight: 30 },
    size = { maxCircleRadius: 15 }
  }) {
    this.margin = margin
    this.size = size
    this.element = element

    this.svg = d3.select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    this.axes = this.svg.append('g').attr('class', 'axes')
    this.categories = this.svg.append('g').attr('class', 'categories')

    this.x = d3.scaleUtc()
    this.y = d3.scaleBand()
  }

  /**
   * @param {ChartData} data
   * @param {{ colorPalette?: {[key: string]: string}, circleScale?: 'linear' | 'sqrt' | 'symlog' }} options
   */
  // eslint-disable-next-line no-unused-vars
  render(data, options = {}) {
    const { width } = this.element.getBoundingClientRect()
    const { colorPalette = defaultColorPalette, circleScale = 'linear' } = options

    const effectiveWidth = width - this.margin.left - this.margin.right

    const maxDataPointValue = /** @type {number} */ (d3.max(
      data.categories.map(({ dataPoints }) => dataPoints.map(({ value }) => value)).flat()
    ))
    const times = data.categories.map(({ dataPoints }) => dataPoints.map(({ time }) => new Date(time))).flat().sort()
    const [timeInterval, timeFormat, shouldRenderTickLabelFn] = findTimeInterval(times)

    let minAndMaxTimes = /** @type {Date[]} */ ([...d3.extent(times)].filter(v => v != null))
    minAndMaxTimes = [
      timeInterval.offset(minAndMaxTimes[0], -1),
      timeInterval.offset(minAndMaxTimes[1], 1)
    ]

    const ticksCount = timeInterval.count(minAndMaxTimes[0], minAndMaxTimes[1])
    const gapWidth = effectiveWidth / ticksCount
    // const circleRadius = /** @type {number} */ (d3.min([gapWidth / 2, this.y.bandwidth() / 2])) - 0.5
    const calculatedCircleRadius = gapWidth / 2 - 0.5

    const circleRadius = /** @type {number} */ (d3.min([calculatedCircleRadius, this.size.maxCircleRadius]))

    const categoryYSpace = (circleRadius * 2) + this.margin.categoryTop

    // after a set of subcategories we want to put a gutter to accommodate pagination.
    // we need to count how many gutters there will be to adjust the height.
    const categoriesGuttersCount = data.categories.reduce((acc, { isSubcategory }, index, items) => {
      const nextItem = index === items.length - 1 ? undefined : items[index + 1]
      if (isSubcategory && (nextItem == null || !nextItem.isSubcategory)) return acc + 1;
      return acc;
    }, 0)

    const calculatedEffectiveHeight = categoryYSpace * data.categories.length +
      this.margin.gutterHeight * categoriesGuttersCount;

    const calculatedHeight = calculatedEffectiveHeight + this.margin.top + this.margin.bottom

    this.svg
      .attr('width', width)
      .attr('height', calculatedHeight)

    this.x
      .domain(minAndMaxTimes)
      .range([this.margin.left, effectiveWidth])

    // show X tick labels every month or year if they are too close together
    const minTickSpacePx = 50 // minimum width between ticks
    const shouldRenderTickLabel = gapWidth < minTickSpacePx
      ? shouldRenderTickLabelFn
      : () => true

    // render label every `labelSpacing` ticks.
    // TODO: 30 is picked after visually checking how close together labels are. There
    // might be a better heuristics out there.
    const labelSpacing = data.categories.length > 0 && data.categories[0].dataPoints.length > 30
      ? 10 : 1

    const xAxis = g => g
      .attr('transform', `translate(0,${calculatedHeight - this.margin.bottom})`)
      .call(d3.axisBottom(this.x)
        // .ticks(times.length + 2)
        .ticks(timeInterval)
        .tickFormat((time, idx) => {
          const shouldRender = idx % labelSpacing === 0
          return shouldRender && shouldRenderTickLabel(/** @type {Date} */ (time)) ? timeFormat(/** @type {Date} */ (time)) : ''
        })
        .tickSizeOuter(0)
        .tickSize(-calculatedEffectiveHeight))

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

    this.y
      .domain(data.categories.map((_, index) => `${index}`))
      .range([this.margin.top, categoryYSpace * data.categories.length])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left}, 0)`)
      // .call(d3.axisLeft(this.y)
      //   .tickSizeOuter(0)
      //   .tickSize(-effectiveWidth))
      .selectAll('text')
      .style('text-anchor', 'end')
      .text(itemValue => itemValue)

    this.axes
      .selectAll('g.y')
      .data([null])
      .join('g')
      .attr('class', 'y')
      .call(yAxis)

    // gutter offsets
    let categoriesOffsets = data.categories.reduce((acc, { isSubcategory }, index, items) => {
      const nextItem = index === items.length - 1 ? undefined : items[index + 1]
      const lastOffset = acc.length > 0 ? acc[acc.length - 1] : 0

      if (isSubcategory && (nextItem == null || !nextItem.isSubcategory)) {
        acc.push(lastOffset + 1)
      } else {
        acc.push(lastOffset)
      }
      return acc;
    }, /** @type {number[]} */ ([]))
    categoriesOffsets = [0].concat(categoriesOffsets)

    const category = this.categories
      .selectAll('g.category')
      .data(data.categories)
      .join('g')
      .attr('class', ({ isSubcategory }) => `category ${isSubcategory ? 'sub' : ''}`)
      .attr('transform', (d, index) => {
        const offset = (this.y(`${index}`) ?? 0) + categoriesOffsets[index] * this.margin.gutterHeight
        return `translate(0, ${offset})`
      })

    category
      .selectAll('rect.highlight')
      .data(category => [category])
      .join('rect')
      .attr('class', 'highlight')
      .attr('height', categoryYSpace - this.margin.sizer * 2)
      .attr('y', this.margin.sizer)
      .attr('x', ({ isSubcategory }) => {
        if (isSubcategory) return this.margin.subCategoryLeft
        return null
      })
      .attr('width', ({ isSubcategory }) => {
        if (isSubcategory) return effectiveWidth - this.margin.subCategoryLeft
        return effectiveWidth
      })

    category
      .selectAll('rect.sizer')
      .data(category => [category])
      .join('rect')
      .attr('class', 'sizer')
      .attr('height', categoryYSpace - this.margin.sizer * 2)
      .attr('y', this.margin.sizer)
      .attr('transform', ({ isSubcategory }) => {
        return isSubcategory ? `translate(${this.margin.subCategoryLeft}, 0)` : null
      })

    const bar = category
      .selectAll('g.bar')
      .data((category, categoryIndex) => {
        const maxValue = d3.max(category.dataPoints.map(({ value }) => value)) ?? 0
        return category.dataPoints.map(dp => ({ ...dp, categoryIndex, maxValue }))
      })
      .join('g')
      .attr('class', 'bar')
      .attr('transform', ({ time }) => `translate(${this.x(new Date(time))}, ${this.margin.categoryTop - this.margin.sizer * 2})`)

    const circleScaler = {
      linear: d3.scaleLinear(),
      sqrt: d3.scaleSqrt(),
      symlog: d3.scaleSymlog(),
    }[circleScale] ?? d3.scaleLinear();

    circleScaler.range([0, circleRadius])
    circleScaler.domain([0, maxDataPointValue])

    bar
      .selectAll('circle.punch')
      .data(dataPoint => [dataPoint], dataPoint => dataPoint.time)
      .join('circle')
      .attr('class', 'punch')
      .attr('r', ({ value }) => {
        return circleScaler(value)
      })
      .attr('cy', circleRadius)
      .attr('fill', d => colorPalette[d.categoryIndex])

    bar
      .selectAll('circle.highlight')
      .data(dataPoint => dataPoint.value === dataPoint.maxValue
        ? [dataPoint]
        : [], dataPoint => dataPoint.time)
      .join('circle')
      .attr('class', 'highlight')
      .attr('r', ({ value }) => {
        return circleScaler(value) * 0.8
      })
      .attr('cy', circleRadius)

    return {
      width,
      height: calculatedHeight,
      yOffsets: data.categories.map((d, index) => {
        return (this.y(`${index}`) ?? 0) + categoriesOffsets[index] * this.margin.gutterHeight
      }),
      categoryYSpace
    }
  }
}