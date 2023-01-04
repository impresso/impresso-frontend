import * as d3 from 'd3'

export default class CategoricalCircleChart {
  constructor({
    element = null,
    margin = { top: 5, bottom: 100, left: 100, right: 5}
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
   * @param {{ itemsDictionary?: {[key: string]: string}, onClick?: (any) => undefined }} options
   */
  // eslint-disable-next-line no-unused-vars
  render(data, lineMetrics = [], areaMetrics = [], options = {}) {
    const { width, height } = this.element.getBoundingClientRect()
    const { itemsDictionary = {}, onClick = () => null } = options

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    const maxValue = /** @type {number} */ (d3.max(data, d => d3.max(lineMetrics.map(({ extractor }) => extractor(d.value))))) ?? d3.max(data.map(d => d.value))

    // X
    const x = d3.scaleBand()
      .domain(data.map(({ domain }) => `${domain.value}`))
      .range([this.margin.left, width - this.margin.right])

    const xAxis = g => g
      .attr('transform', `translate(0,${height - this.margin.bottom})`)
      .style('stroke-dasharray',('3,3'))
      .call(
        d3.axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
          .tickSize(-height)
      )
      .call(g => g.selectAll('line').style('stroke', '#eee'))
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
    const y = d3.scaleBand()
      .domain(lineMetrics.map(({ id }) => id))
      .range([height - this.margin.bottom, this.margin.top])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .style('stroke-dasharray',('3,3'))
      .call(
        d3.axisLeft(y)
          .tickSizeOuter(0)
          .tickSize(-width)
      )
      .call(g => g.selectAll('line').style('stroke', '#eee'))
      .selectAll('text')
      .style('text-anchor', 'end')
      .text(itemValue => {
        return itemsDictionary[itemValue] || itemsDictionary
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
      .attr('transform', dataItem => `translate(${x(`${dataItem.domain.value}`)})`)

    const circleRadius = /** @type {number} */ (d3.min([x.bandwidth(), y.bandwidth()])) / 2

    bar
      .selectAll('circle')
      .data(dataItem => lineMetrics
        .map(({ id, extractor }) => ({ id, value: extractor(dataItem.value), item: dataItem }))
        .filter(({ value }) => !isNaN(value)),
      ({ id }) => id)
      .join('circle')
      .attr('class', ({ id }) => id)
      .attr('transform', ({ id }) => `translate(0, ${y(id)})`)
      .attr('r', ({ value }) => {
        return (value / maxValue) * circleRadius * 0.9
      })
      .attr('cx', x.bandwidth() / 2)
      .attr('cy', y.bandwidth() / 2)
      .attr('fill', ({ value }) => d3.interpolateGreys(0.5 + (value / maxValue) / 2))
      .on('click', item => onClick(item))
  }
}