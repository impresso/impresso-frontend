import * as d3 from 'd3'

export default class CategoricalMultiValueBarChartHorizontal {
  constructor({ element = null, margin = { top: 5, bottom: 45, left: 100, right: 20 } }) {
    this.margin = margin
    this.element = element

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('class', 'position-absolute top-0')

    this.axes = this.svg.append('g').attr('class', 'axes')
    this.bars = this.svg.append('g').attr('class', 'bars')
    this.pointer = this.svg.append('g').attr('class', 'pointer pointer-events-none')
  }

  getClosestScaleband(value, scale) {
    const domain = scale.domain
    const range = scale.range()
    const step = scale.step()
    const reverse = range[1] < range[0]
    const start = range[reverse - 0]
    const stop = range[1 - reverse]
    // ignore paddingOuter or paddingInner
    let domainIndex = domain().length - 1

    if (value > stop) {
      domainIndex = 0
    } else if (value > start) {
      domainIndex = domain().length - Math.floor((value - start) / step) - 1
    }
    return { domainValue: domain()[domainIndex], domainIndex }
  }

  getClosestPoint(x0, y0, data, scale, xValue, maxDistance = 20) {
    const band = this.getClosestScaleband(y0, scale)
    const closestPoint = data[band.domainIndex]
    const closestValueKey = Object.keys(closestPoint.value).reduce((acc, k) => {
      const distance = Math.abs(closestPoint.value[k] - xValue)
      if (distance > maxDistance) return acc
      if (acc === null) return k
      return distance < Math.abs(closestPoint.value[acc] - xValue) ? k : acc
    }, null) // Object.keys(closestPoint.value)[0])
    // console.debug('getClosestPoint', data[band.domainIndex])
    return {
      closestValueKey,
      closestPoint,
      closestIndex: band.domainIndex
    }
  }
  /**
   * @typedef {{ label: string, value: string | number }} Category
   * @typedef {{ domain: Category, value: any }} DataItem
   * @typedef {(any) => number} LineValueExtractor
   * @typedef {(any) => [number, number]} AreaValueExtractor
   *
   * @param {DataItem[]} data
   * @param {{ id: string, extractor: LineValueExtractor}[]} lineMetrics
   * @param {{ id: string, extractor: AreaValueExtractor}[]} areaMetrics
   * @param {{ colorPalette?: {[key: string]: string} }} options
   */
  render(data, lineMetrics = [], areaMetrics = [], options = {}) {
    const { width, height: boxHeight } = this.element.getBoundingClientRect()
    const height = options.bandwidth ? options.bandwidth * data.length : boxHeight
    const {
      colorPalette = {},
      margin = {},
      transformLabels = 'rotate(-45)',
      truncateLabelsAtLength,
      floatingPointPrecision = 2
    } = options
    this.margin = { ...this.margin, ...margin }

    const xDomain = Array.isArray(options.xDomain)
      ? options.xDomain
      : [
          /** @type {number} */ (
            d3.min(data, d => d3.min(lineMetrics.map(({ extractor }) => extractor(d.value))))
          ),
          /** @type {number} */ (
            d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value))))
          )
        ]
    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    // X
    const x = d3
      .scaleLinear()
      .domain(xDomain) // [0, /** @type {number} */ (d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value)))))]).nice()
      .range([this.margin.left, width - this.margin.right])
      .clamp(true)

    const xAxis = g =>
      g
        .attr('transform', `translate(0,${height - this.margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        )
        .selectAll('text')
        .style('text-anchor', 'end')

    this.axes.selectAll('g.x').data([null]).join('g').attr('class', 'x').call(xAxis)

    // Y
    const y = d3
      .scaleBand()
      .domain(data.map(({ domain }) => `${domain.value}`))
      // height is calculated against options.bandwidth if available
      .range([height - this.margin.bottom, this.margin.top])

    const yAxis = g =>
      g
        .attr('transform', `translate(${this.margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
        )

        .selectAll('text')
        .attr('transform', transformLabels)
        // add esslipsis if text lenght is greater than 20
        .text(itemValue => {
          const dataItem = data.find(({ domain }) => itemValue === domain.value)
          const label = dataItem != null ? dataItem.domain.label : itemValue || ''
          if (!truncateLabelsAtLength) {
            return label
          }
          // add ellipsis if text length is greater than 20
          return label.length > truncateLabelsAtLength
            ? `${label.slice(0, truncateLabelsAtLength)}...`
            : label
        })

    this.axes.selectAll('g.y').data([null]).join('g').attr('class', 'y').call(yAxis)

    const bar = this.bars
      .selectAll('g.bar')
      .data(data)
      .join('g')
      .attr('class', 'bar')
      .attr('transform', dataItem => `translate(0, ${y(`${dataItem.domain.value}`)})`)

    bar
      .selectAll('g.lines')
      .data(dataItem => [dataItem])
      .join('g')
      .attr('class', 'lines')
      .selectAll('rect')
      .data(
        dataItem => {
          return lineMetrics
            .map(({ id, extractor }) => ({ id, value: extractor(dataItem.value) }))
            .filter(({ value }) => !isNaN(value))
        },
        ({ id }) => id
      )
      .join('rect')
      .attr('class', ({ id }) => id)
      .attr('width', 1)
      .attr('y', 1)
      .attr('x', ({ value }) => x(value))
      .attr('height', y.bandwidth() - 2)
      .attr('fill', metric => colorPalette[metric.id])

    bar
      .selectAll('g.areas')
      .data(dataItem => [dataItem])
      .join('g')
      .attr('class', 'areas')
      .selectAll('rect')
      .data(
        dataItem => {
          return areaMetrics
            .map(({ id, extractor }) => ({ id, value: extractor(dataItem.value) }))
            .filter(({ value: [valueA, valueB] }) => !isNaN(valueA) && !isNaN(valueB))
        },
        ({ id }) => id
      )
      .join('rect')
      .attr('class', ({ id }) => id)
      .attr('width', ({ value: [valueA, valueB] }) => x(valueB) - x(valueA))
      .attr('y', y.bandwidth() / 4)
      .attr('x', ({ value: [a] }) => x(a))
      .attr('height', y.bandwidth() / 2)
      .attr('fill', metric => colorPalette[metric.id])

    // add line to the pointer group
    this.pointer
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', height - 30)
      .attr('stroke', 'var(--clr-grey-800)')
      .attr('stroke-width', 1)

    const pointerValue = this.pointer
      .append('text')
      .attr('transform', `translate(0, ${height - 12})`)
      .attr('fill', 'var(--dark)')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
    // mousemove
    // if (typeof options.onMouseMove === 'function') {
    this.svg.on('mousemove', event => {
      const [xMouse, yMouse] = d3.pointer(event)
      this.pointer.attr(
        'transform',
        `translate(${Math.max(Math.min(width - this.margin.right, xMouse), this.margin.left)}, 0)`
      )
      const xValue = x.invert(xMouse, yMouse)
      pointerValue.text(Number(xValue).toFixed(floatingPointPrecision))
      options.onMouseMove({
        point: {
          ...this.getClosestPoint(xMouse, yMouse, data, y, xValue),
          x: xMouse,
          y: yMouse - this.element.scrollTop
        }
      })
    })
    // }
  }
}
