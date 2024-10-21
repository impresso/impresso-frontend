import * as d3 from 'd3'

/**
 * @typedef {string} Color
 * @typedef {{
 *  element: d3.BaseType | any,
 *  margin?: {left: number, right: number, top: number, bottom: number },
 *  sizes?: { barSpacing: number, barHeight: number },
 *  offsets?: { barValue: string },
 *  roundValueFn?: (v: number) => string
 * }} ConstructorOptions
 */

const IntersectionPatternId = 'diverging-bars-intersection-pattern'
const IntersectionPatternIdFlipped = 'diverging-bars-intersection-pattern-flipped'

export default class DivergingBarsChart {
  /** @param {ConstructorOptions} options */
  constructor({
    element = null,
    margin = { top: 10, bottom: 10, left: 45, right: 45 },
    sizes = { barSpacing: 18, barHeight: 15 },
    offsets = { barValue: '0.5em' },
    roundValueFn = v => `${v}`
  }) {
    this.margin = margin
    this.sizes = sizes
    this.offsets = offsets
    this.element = element

    this.roundValueFn = roundValueFn

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    this.yAxis = this.svg.append('line').attr('class', 'y-axis')

    const defs = this.svg.append('defs')

    const pattern = defs
      .append('pattern')
      .attr('id', IntersectionPatternId)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('height', 4)
      .attr('width', 4)

    pattern.append('path').attr('class', 'path-a').attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')

    pattern.append('path').attr('class', 'path-b').attr('d', 'M-1,3 L3,-1 M1,5 L5,1')

    const patternFlipped = defs
      .append('pattern')
      .attr('id', IntersectionPatternIdFlipped)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('height', 4)
      .attr('width', 4)

    patternFlipped
      .append('path')
      .attr('class', 'path-a')
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('transform', 'rotate(90, 2, 2)')

    patternFlipped
      .append('path')
      .attr('class', 'path-b')
      .attr('d', 'M-1,3 L3,-1 M1,5 L5,1')
      .attr('transform', 'rotate(90, 2, 2)')

    this.bars = this.svg.append('g').attr('class', 'bars')
    this.labels = this.svg.append('g').attr('class', 'labels')
    this.intersection = this.svg.append('g').attr('class', 'intersections')

    this.y = d3.scaleLinear()

    // this.borderRect = this.svg.append('rect')

    this._lastHeight = 0

    this._interactionActive = false
    this._lastMousePosition = [0, 0]
    this._lastItem = undefined

    // interaction
    this.svg
      .on('mousemove', () => this._handleInteraction())
      .on('mouseover', () => {
        this._interactionActive = true
        this._handleInteraction()
      })
      .on('mouseout', () => {
        this._interactionActive = false
        this._handleInteraction()
      })
  }

  /**
   * @typedef {{ left: number, right, number, intersection: number, label: string }} Item
   * @param {Item[]} data
   * @param {{ scale?: 'linear' | 'sqrt' }} options
   */
  render(data, { scale = 'linear' } = {}) {
    const { width } = this.element.getBoundingClientRect()

    const height =
      data.length * (this.sizes.barHeight + this.sizes.barSpacing) +
      this.margin.top +
      this.margin.bottom

    this._lastHeight = height

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    const maxValues = data.map(({ left, right, intersection }) =>
      d3.max([left, right, intersection])
    )
    const maxValue = d3.max(maxValues)

    this.y.domain([0, data.length]).range([this.margin.top, height - this.margin.bottom])

    const midWidth = this.margin.right + (width - this.margin.left - this.margin.right) / 2

    const barX = scale === 'sqrt' ? d3.scaleSqrt() : d3.scaleLinear()

    barX.domain([0, maxValue]).range([0, (width - this.margin.left - this.margin.right) / 2])

    // // NOTE: Borders for development
    // this.borderRect
    //   .attr('x', this.margin.left)
    //   .attr('width', width - this.margin.left - this.margin.right)
    //   .attr('y', this.y.range()[0])
    //   .attr('height', this.y.range()[1] - this.y.range()[0])
    //   .attr('stroke', '#999')

    this.yAxis
      .attr('transform', `translate(${midWidth}, 0)`)
      .attr('y1', this.y.range()[0])
      .attr('y2', this.y.range()[1])

    // bars
    this.bars
      .attr('transform', `translate(${midWidth}, ${this.sizes.barSpacing})`)
      .selectAll('g.side')
      .data([
        data.map(({ left }) => ({ value: left })),
        data.map(({ right }) => ({ value: right }))
      ])
      .join('g')
      .attr('class', (d, index) => {
        const sideClass = index === 0 ? 'left' : 'right'
        return `side ${sideClass}`
      })
      .attr('transform', (d, index) => `scale(${index === 0 ? -1 : 1}, 1)`)
      .call(g => this._renderBars(g, barX))

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

    // intersections
    const intersectionX = value => (value > 0 && barX(value) < 1 ? 1 : barX(value))
    const intersectionSides = this.intersection
      .attr('transform', `translate(${midWidth}, ${this.sizes.barSpacing})`)
      .selectAll('g')
      .data([data, data])
      .join('g')
      .attr('transform', (d, index) => `scale(${index === 0 ? -1 : 1}, 1)`)

    intersectionSides
      .selectAll('rect')
      .data((d, index) =>
        d.map(({ intersection }) => ({ value: intersection, flipped: index === 0 }))
      )
      .join('rect')
      .attr('transform', (d, idx) => `translate(0, ${this.y(idx)})`)
      .attr('height', this.sizes.barHeight)
      .attr('width', ({ value }) => intersectionX(value))
      .attr(
        'fill',
        ({ flipped }) => `url("#${flipped ? IntersectionPatternIdFlipped : IntersectionPatternId}")`
      )

    this._handleInteraction()
  }

  _renderBars(sidesContainer, barX) {
    const barContainer = sidesContainer
      .selectAll('g.bar')
      .data((d, index) => d.map(d => ({ ...d, flipped: index === 0 })))
      .join('g')
      .attr('class', 'bar')
      .attr('transform', (d, index) => `translate(0, ${this.y(index)})`)

    barContainer
      .selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('height', this.sizes.barHeight)
      .attr('width', ({ value }) => barX(value))

    barContainer
      .selectAll('text')
      .data(d => [d])
      .join('text')
      .attr(
        'transform',
        ({ value, flipped }) => `translate(${barX(value)}, 0), scale(${flipped ? -1 : 1},1)`
      )
      .attr('dy', this.sizes.barHeight / 2)
      .attr('dx', ({ flipped }) => `${flipped ? '-' : '+'}${this.offsets.barValue}`)
      .attr('text-anchor', ({ flipped }) => (flipped ? 'end' : 'start'))
      .text(({ value }) => this.roundValueFn(value))
      .attr('alignment-baseline', 'middle')

    return sidesContainer
  }

  getLastHeight() {
    return this._lastHeight
  }

  _handleInteraction(event) {
    if (!d3.event) return

    let [mouseX, mouseY] = d3.pointer(event)

    this._lastMousePosition = [mouseX, mouseY]

    const currentBarIndex = this.y.invert(mouseY)

    const item = this.labels.selectAll('text').data()[Math.floor(currentBarIndex)]
    this._lastItem = item
  }

  tooltipData() {
    const [x, y] = this._lastMousePosition

    return {
      x,
      y,
      isActive: this._interactionActive,
      item: this._lastItem
    }
  }
}
