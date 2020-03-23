import * as d3 from 'd3';

export default class LineChart {
  constructor({
    element = null,
    margin = { top: 5, bottom: 25, left: 45, right: 5}
  }) {
    this.margin = margin
    this.element = element

    this.svg = d3.select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    this.axes = this.svg.append('g').attr('class', 'axes')
    this.lines = this.svg.append('g').attr('class', 'lines')
  }

  /**
   * @param {{ date: Date, value: { [key: string]: number } }[]} data
   * @param {string[]} metrics
   */
  render(data, metrics = []) {
    const { width, height } = this.element.getBoundingClientRect()

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    // X
    const x = d3.scaleUtc()
      .domain(/** @type {Date[]} */ (d3.extent(data, d => d.date)))
      .range([this.margin.left, width - this.margin.right])

    const xAxis = g => g
      .attr('transform', `translate(0,${height - this.margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    this.axes
      .selectAll('g.x')
      .data([null])
      .join('g')
      .attr('class', 'x')
      .call(xAxis)

    // Y
    const y = d3.scaleLinear()
      .domain([0, /** @type {number} */ (d3.max(data, d => d.value.max ? d.value.max : 0))]).nice()
      .range([height - this.margin.bottom, this.margin.top])

    const yAxis = g => g
      .attr('transform', `translate(${this.margin.left},0)`)
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

    // lines
    const line = d3.line()
      .defined(([, value]) => !isNaN(value))
      .x(([date]) => x(date))
      .y(([, value]) => y(value))

    const linesContainers = this.lines
      .selectAll('g')
      .data(metrics)
      .join('g')
      .attr('class', metric => metric)

    linesContainers
      .selectAll('path.metric')
      .data((metric, index) => {
        const lineData = data
          .map(d => /** @type {[number, number]} */ ([d.date.getTime(), d.value[metric]]))
        return [{ metric, index, data: lineData }]
      })
      .join('path')
      .attr('class', 'metric')
      .attr('stroke', ({ index }) => d3.schemeCategory10[index])
      .attr('stroke-width', 1.5)
      .attr('d', ({ data }) => line(data))
  }
}