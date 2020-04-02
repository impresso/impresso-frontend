import * as d3 from 'd3'

/**
 * @typedef {string} Color
 * @typedef {{
 *  element: d3.BaseType | any,
 *  margin?: {left: number, right: number, top: number, bottom: number },
 *  colors?: { yAxis: Color, colorLeft: Color, colorRight: Color, text: Color },
 *  sizes?: { barSpacing: number, barHeight: number, font: string },
 *  offsets?: { barValue: string }
 * }} ConstructorOptions
 */

const IntersectionPatternId = 'intersection-pattern'

export default class DivergingBarsChart {
  /** @param {ConstructorOptions} options */
  constructor({
    element = null,
    margin = { top: 10, bottom: 10, left: 40, right: 40 },
    colors = {
      yAxis: '#ddd',
      colorLeft: /** @type {string} */ (d3.color('lightgrey')?.darker(1)?.toString()),
      colorRight: /** @type {string} */ (d3.color('lightgrey')?.toString()),
      text: /** @type {string} */ '#333'
    },
    sizes = { barSpacing: 18, barHeight: 15, font: '0.6em' },
    offsets = { barValue: '0.5em' }
  }) {
    this.margin = margin
    this.colors = colors
    this.sizes = sizes
    this.offsets = offsets
    this.element = element

    this.svg = d3.select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    this.yAxis = this.svg
      .append('line')
      .attr('class', 'y-axis')
      .attr('stroke', this.colors.yAxis ?? null)

    const defs = this.svg.append('defs');

    const pattern = defs
      .append('pattern')
      .attr('id', IntersectionPatternId)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('height', 4)
      .attr('width', 4)

    pattern.append('path')
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('stroke', this.colors.colorLeft)
      .attr('stroke-width', 1.5)

    pattern.append('path')
      .attr('d', 'M-1,3 L3,-1 M1,5 L5,1')
      .attr('stroke', this.colors.colorRight)
      .attr('stroke-width', 1.5)

    this.bars = this.svg.append('g').attr('class', 'bars')
    this.labels = this.svg.append('g').attr('class', 'labels')
    this.intersection = this.svg.append('g').attr('class', 'intersections')

    this.barX = d3.scaleLinear()
    this.y = d3.scaleLinear()

    this.borderRect = this.svg.append('rect')

    this._lastHeight = 0
  }

  /**
   * @typedef {{ left: number, right, number, intersection: number, label: string }} Item
   * @param {Item[]} data
   */
  render(data) {
    const { width } = this.element.getBoundingClientRect()

    const height = data.length * (this.sizes.barHeight + this.sizes.barSpacing)
      + this.margin.top
      + this.margin.bottom

    this._lastHeight = height

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    const maxValues = data.map(({ left, right, intersection }) => d3.max([left, right, intersection]))
    const maxValue = d3.max(maxValues)

    this.y
      .domain([0, data.length])
      .range([this.margin.top, height - this.margin.bottom])

    const midWidth = this.margin.right + (width - this.margin.left - this.margin.right) / 2

    this.barX
      .domain([0, maxValue])
      .range([0, (width - this.margin.left - this.margin.right) / 2])

    // NOTE: Borders for development
    this.borderRect
      .attr('x', this.margin.left)
      .attr('width', width - this.margin.left - this.margin.right)
      .attr('y', this.y.range()[0])
      .attr('height', this.y.range()[1] - this.y.range()[0])
      .attr('stroke', '#999')

    this.yAxis
      .attr('transform', `translate(${midWidth}, 0)`)
      .attr('y1', this.y.range()[0])
      .attr('y2', this.y.range()[1])

    // bars
    this.bars
      .attr('transform', `translate(${midWidth}, ${this.sizes.barSpacing})`)
      .selectAll('g.side')
      .data([
        data.map(({ left }) => ({ value: left})),
        data.map(({ right }) => ({ value: right}))
      ])
      .join('g')
      .attr('class', 'side')
      .attr('transform', (d, index) => `scale(${ index === 0 ? -1 : 1}, 1)`)
      .call(this._renderBars.bind(this))

    // labels
    this.labels
      .attr('transform', `translate(${midWidth}, ${Math.ceil(this.sizes.barSpacing / 2)})`)
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('transform', (d, idx) => `translate(0, ${this.y(idx)})`)
      .text(({ label }) => `${label}`)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill', this.colors.text)
      .attr('font-size', this.sizes.font)

    // intersections
    const intersectionX = value => value > 0 && this.barX(value) < 1 ? 1 : this.barX(value)
    this.intersection
      .attr('transform', `translate(${midWidth}, ${this.sizes.barSpacing})`)
      .selectAll('rect')
      .data(data.map(({ intersection }) => ({ value: intersection })))
      .join('rect')
      .attr('transform', ({ value }, idx) => `translate(-${intersectionX(value) / 2}, ${this.y(idx)})`)
      .attr('height', this.sizes.barHeight)
      .attr('width', ({ value }) => intersectionX(value))
      .attr('fill', `url("#${IntersectionPatternId}")`)
  }

  _renderBars(sidesContainer) {

    const barContainer = sidesContainer
      .selectAll('g.bar')
      .data((d, index) => d.map(d => ({ ...d, flipped: index === 0})))
      .join('g')
      .attr('class', 'bar')
      .attr('transform', (d, index) => `translate(0, ${this.y(index)})`)

    barContainer
      .selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('height', this.sizes.barHeight)
      .attr('width', ({ value }) => this.barX(value))
      .attr('fill', ({ flipped }) => flipped ? this.colors.colorLeft : this.colors.colorRight)

    barContainer
      .selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('transform', ({ value, flipped }) => `translate(${this.barX(value)}, 0), scale(${flipped ? -1 : 1},1)`)
      .attr('dy', this.sizes.barHeight / 2)
      .attr('dx', ({ flipped }) => `${flipped ? '-' : '+' }${this.offsets.barValue}`)
      .attr('text-anchor', ({ flipped }) => flipped ? 'end' : 'start')
      .text(({ value }) => parseInt(value, 10))
      .attr('alignment-baseline', 'middle')
      .attr('fill', this.colors.text)
      .attr('font-size', this.sizes.font)

    return sidesContainer
  }

  getLastHeight() { return this._lastHeight; }
}