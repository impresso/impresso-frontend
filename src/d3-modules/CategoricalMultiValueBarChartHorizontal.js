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
    this.element.style.position = 'relative'
    // scroll y
    this.element.style.overflowY = 'auto'

    this.axes = this.svg.append('g').attr('class', 'axes')
    this.bars = this.svg.append('g').attr('class', 'bars')
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
    const { colorPalette = {}, margin = {}, transformLabels = 'rotate(-45)' } = options
    this.margin = { ...this.margin, ...margin }

    const xDomain = [
      /** @type {number} */ (d3.min(data, d =>
        d3.min(lineMetrics.map(({ extractor }) => extractor(d.value))),
      )),
      /** @type {number} */ (d3.max(data, d =>
        d3.max(lineMetrics.map(({ extractor }) => extractor(d.value))),
      )),
    ]
    console.debug('CategoricalMultiValueBarChartHorizontal.render extent:', xDomain, options)
    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    // X
    const x = d3
      .scaleLinear()
      .domain(xDomain) // [0, /** @type {number} */ (d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value)))))]).nice()
      .range([this.margin.left, width - this.margin.right])

    const xAxis = g =>
      g
        .attr('transform', `translate(0,${height - this.margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0),
        )
        .selectAll('text')
        .style('text-anchor', 'end')

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

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
            .attr('font-weight', 'bold'),
        )

        .selectAll('text')
        .attr('transform', transformLabels)
        .text(itemValue => {
          const dataItem = data.find(({ domain }) => itemValue === domain.value)
          return dataItem != null ? dataItem.domain.label : ''
        })

    this.axes
      .selectAll('g.y')
      .data([null])
      .join('g')
      .attr('class', 'y')
      .call(yAxis)

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
        ({ id }) => id,
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
        ({ id }) => id,
      )
      .join('rect')
      .attr('class', ({ id }) => id)
      .attr('width', ({ value: [valueA, valueB] }) => x(valueB) - x(valueA))
      .attr('y', y.bandwidth() / 4)
      .attr('x', ({ value: [a] }) => x(a))
      .attr('height', y.bandwidth() / 2)
      .attr('fill', metric => colorPalette[metric.id])
  }
}
