import * as d3 from 'd3'

export default class CategoricalMultiValueBarChart {
  constructor({
    element = null,
    margin = { top: 5, bottom: 100, left: 45, right: 5}
  }) {
    this.margin = margin
    this.element = element

    this.svg = d3.select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

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
    const { width, height } = this.element.getBoundingClientRect()
    const { colorPalette = {} } = options

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    // X
    const x = d3.scaleBand()
      .domain(data.map(({ domain }) => `${domain.value}`))
      .range([this.margin.left, width - this.margin.right])

    const xAxis = g => g
      .attr('transform', `translate(0,${height - this.margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-65)')
      .text(itemValue => {
        const dataItem = data.find(({ domain }) => itemValue === domain.value)
        return dataItem != null ? dataItem.domain.label : ''
      })

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

    // Y
    const y = d3.scaleLinear()
      .domain([0, /** @type {number} */ (d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value)))))]).nice()
      .range([height - this.margin.bottom, this.margin.top])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold'))

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
      .attr('transform', dataItem => `translate(${x(`${dataItem.domain.value}`)})`)

    bar
      .selectAll('g.lines')
      .data(dataItem => [dataItem])
      .join('g')
      .attr('class', 'lines')
      .selectAll('rect')
      .data(dataItem => {
        return lineMetrics
          .map(({ id, extractor }) => ({ id, value: extractor(dataItem.value)}))
          .filter(({ value }) => !isNaN(value))
      }, ({ id }) => id)
      .join('rect')
      .attr('class', ({ id }) => id)
      .attr('height', 1)
      .attr('x', 1)
      .attr('y', ({ value }) => y(value))
      .attr('width', x.bandwidth() - 2)
      .attr('fill', metric => colorPalette[metric.id])

    bar
      .selectAll('g.areas')
      .data(dataItem => [dataItem])
      .join('g')
      .attr('class', 'areas')
      .selectAll('rect')
      .data(dataItem => {
        return areaMetrics
          .map(({ id, extractor }) => ({ id, value: extractor(dataItem.value)}))
          .filter(({ value: [valueA, valueB] }) => !isNaN(valueA) && !isNaN(valueB))
      }, ({ id }) => id)
      .join('rect')
      .attr('class', ({ id }) => id)
      .attr('height', ({ value: [valueA, valueB] }) => y(valueA) - y(valueB))
      .attr('x', x.bandwidth()/4)
      .attr('y', ({ value: [, v] }) => y(v))
      .attr('width', x.bandwidth()/2)
      .attr('fill', metric => colorPalette[metric.id])
  }
}