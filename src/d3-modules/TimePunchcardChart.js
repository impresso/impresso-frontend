import * as d3 from 'd3'

const OneDayInMs = 1000 * 60 * 60 * 24 // 1 day

/** @param {Date} date */
const isExactYear = date => date.getMonth() === 0 && date.getDate() === 1
/** @param {Date} date */
const isExactMonth = date => date.getDate() === 1

/**
 * @param {Date[]} times
 * @returns { [any, (date: Date) => string, (date: Date) => boolean] }
 */
function findTimeInterval(times) {
  const minTimeIntervalDays = times.reduce((minInterval, value, index, values) => {
    if (index === 0) return minInterval
    const previousValue = values[index - 1]
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
 * @typedef {{ label?: string, dataPoints: DataPoint[] }} ChartCategory
 * @typedef {{ categories: ChartCategory[] }} ChartData
 */

export default class TimePunchcardChart {
  constructor({
    element = null,
    margin = { top: 5, bottom: 15, left: 15, right: 10 }
  }) {
    this.margin = margin
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
   * @param {{ colorPalette?: {[key: string]: string} }} options
   */
  // eslint-disable-next-line no-unused-vars
  render(data, options = {}) {
    const { width, height } = this.element.getBoundingClientRect()
    const { colorPalette = d3.schemeCategory10 } = options

    const effectiveWidth = width - this.margin.left - this.margin.right
    const effectiveHeight = height - this.margin.top - this.margin.bottom

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    const maxDataPointValue = /** @type {number} */ (d3.max(
      data.categories.map(({ dataPoints }) => dataPoints.map(({ value }) => value)).flat()
    ))
    const times = data.categories.map(({ dataPoints }) => dataPoints.map(({ time }) => new Date(time))).flat().sort()
    const [timeInterval, timeFormat, shouldRenderTickLabelFn] = findTimeInterval(times)

    const timeStepMs = times.length >= 2 ? times[1].getTime() - times[0].getTime() : 0
    let minAndMaxTimes = /** @type {Date[]} */ ([...d3.extent(times)].filter(v => v != null))
    minAndMaxTimes = [
      timeInterval.floor(new Date(minAndMaxTimes[0].getTime() - timeStepMs)),
      timeInterval.ceil(new Date(minAndMaxTimes[1].getTime() + timeStepMs))
    ]

    this.x
      .domain(minAndMaxTimes)
      .range([this.margin.left, effectiveWidth])

    // show X tick labels every month or year if they are too close together
    const minTickSpacePx = 50 // minimum width between ticks
    const shouldRenderTickLabel = effectiveWidth / times.length < minTickSpacePx
      ? shouldRenderTickLabelFn
      : () => true


    const xAxis = g => g
      .attr('transform', `translate(0,${height - this.margin.bottom})`)
      .call(d3.axisBottom(this.x)
        // .ticks(times.length + 2)
        .ticks(timeInterval)
        .tickFormat(time => {
          return shouldRenderTickLabel(/** @type {Date} */ (time)) ? timeFormat(/** @type {Date} */ (time)) : ''
        })
        .tickSizeOuter(0)
        .tickSize(-effectiveHeight))

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

    this.y
      .domain(data.categories.map((_, index) => `${index}`))
      .range([this.margin.top, effectiveHeight])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.y)
        .tickSizeOuter(0)
        .tickSize(-effectiveWidth))
      .selectAll('text')
      .style('text-anchor', 'end')
      .text(itemValue => itemValue)

    this.axes
      .selectAll('g.y')
      .data([null])
      .join('g')
      .attr('class', 'y')
      .call(yAxis)

    const category = this.categories
      .selectAll('g.category')
      .data(data.categories)
      .join('g')
      .attr('class', 'category')
      .attr('transform', (d, index) => `translate(0, ${this.y(`${index}`)})`)

    const bar = category
      .selectAll('g.bar')
      .data((category, categoryIndex) => category.dataPoints.map(dp => ({ ...dp, categoryIndex })))
      .join('g')
      .attr('class', 'bar')
      .attr('transform', ({ time }) => `translate(${this.x(new Date(time))})`)

    const xBandwidth = effectiveWidth / times.length
    const circleRadius = /** @type {number} */ (d3.min([xBandwidth / 2, this.y.bandwidth() / 2])) / 2

    bar
      .selectAll('circle.punch')
      .data(dataPoint => [dataPoint])
      .join('circle')
      .attr('class', 'punch')
      .attr('r', ({ value }) => {
        return (value / maxDataPointValue) * circleRadius * 0.9
      })
      .attr('cy', this.y.bandwidth() / 2)
      .attr('fill', d => colorPalette[d.categoryIndex])
  }
}