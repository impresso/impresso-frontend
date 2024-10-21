import * as d3 from 'd3'

export default class TimeMultiLineChart {
  constructor({
    element = null,
    margin = { top: 10, bottom: 25, left: 5, right: 5 },
    labelsPanelWidth = 100,
    labelFontSize = '0.8em',
    roundValueFn = (/** @type {number} */ v) => `${v}`
  }) {
    this.margin = margin
    this.element = element
    this.labelsPanelWidth = labelsPanelWidth
    this.labelFontSize = labelFontSize

    this.roundValueFn = roundValueFn

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    this.axes = this.svg.append('g').attr('class', 'axes')
    this.lines = this.svg.append('g').attr('class', 'lines')
    this.peak = this.svg.append('g').attr('class', 'peak')
    this.labels = this.svg.append('g').attr('class', 'labels')
    this.interaction = this.svg.append('g').attr('class', 'interaction')

    this.x = d3.scaleUtc()
    this.y = d3.scaleLinear()

    this._interactionActive = false
    this._lastColorPalette = {}
    /** @type {{ label: string, item: Item }[]} */
    this._lastNearestItems = []
    this._lastMousePosition = [0, 0]

    // interaction
    this.svg
      .on('mousemove', e => this._renderInteractionLayer(e))
      .on('mouseover', e => {
        this._interactionActive = true
        this._renderInteractionLayer(e)
      })
      .on('mouseout', e => {
        this._interactionActive = false
        this._renderInteractionLayer(e)
      })
  }

  /**
   * @typedef {{ value: number, time: Date }} Item
   * @typedef {{ items: Item[], label: string }} ItemsSet
   *
   * @param {ItemsSet[]} data
   * @param {{ colorPalette?: {[key: string]: string} }} options
   */
  render(data, options = {}) {
    const { width, height } = this.element.getBoundingClientRect()
    const { colorPalette = {} } = options

    this._lastColorPalette = colorPalette

    this.svg.attr('viewBox', [0, 0, width, height].join(' '))

    // X
    const times = data.flatMap(({ items }) => items.map(({ time }) => time))
    const minAndMaxTimes = /** @type {Date[]} */ ([...d3.extent(times)].filter(v => v != null))

    this.x
      .domain(minAndMaxTimes)
      .range([this.margin.left, width - this.labelsPanelWidth - this.margin.right])

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - this.margin.bottom})`).call(
        d3
          .axisBottom(this.x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )

    this.axes.selectAll('g.x').data([null]).join('g').attr('class', 'x').call(xAxis)

    // Y
    const maxValue = d3.max(data, ({ items }) => d3.max(items, ({ value }) => value))
    this.y
      .domain([0, maxValue != null ? maxValue : 0])
      .nice()
      .range([height - this.margin.bottom, this.margin.top])

    // Lines

    // @ts-ignore
    const line = /** @type {d3.Line<Item>} */ (d3.line())
      .defined(({ value }) => !isNaN(value))
      .x(({ time }) => this.x(time))
      .y(({ value }) => this.y(value))

    const linesContainers = this.lines
      .selectAll('g')
      .data(data, ({ label }) => label)
      .join('g')
      .attr('class', ({ label }) => label)

    // line with data and missing data points
    linesContainers
      .selectAll('path.missing')
      .data(
        ({ items, ...rest }, index) => [{ ...rest, items: items.filter(line.defined()), index }],
        ({ label }) => label
      )
      .join('path')
      .attr('class', 'missing')
      .attr('stroke', '#eee')
      .attr('pointer-events', 'none')
      .attr('d', ({ items }) => line(items))

    // line with data
    linesContainers
      .selectAll('path.metric')
      .data(
        (itemsSet, index) => [{ ...itemsSet, index }],
        ({ label }) => label
      )
      .join('path')
      .attr('class', 'metric')
      .attr('stroke', ({ label, index }) => colorPalette[label] || d3.schemeCategory10[index])
      .attr('stroke-width', 1.5)
      .attr('pointer-events', 'none')
      .attr('d', ({ items }) => line(items))

    // peak
    const maxValueTime = data
      .map(({ items }) => items.find(({ value }) => value === maxValue)?.time)
      .filter(v => v != null)[0]

    const peak = this.peak
      .data(
        /** @type {[Date, number][]} */ (
          maxValueTime != null && maxValue != null ? [[maxValueTime, maxValue]] : []
        )
      )
      .attr('transform', ([time, value]) => `translate(${this.x(time)}, ${this.y(value)})`)

    peak
      .selectAll('circle')
      .data(d => [d])
      .join('circle')
      .attr('r', 2)
      .attr('fill', '#333')

    peak
      .selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('fill', '#333')
      .attr('font-size', this.labelFontSize)
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text(([, value]) => this.roundValueFn(value))

    // labels
    this.labels.attr('transform', `translate(${width - this.labelsPanelWidth}, 0)`)

    const labelElementHeightPixels = this._getLabelElementHeightPixels()
    const labelValueGridSize = this.y.invert(0) - this.y.invert(labelElementHeightPixels)
    // set of values to do a "snap to grid" rounding of the last value of every line to
    // find the vertical position of the label
    const valueBuckets = d3.range(this.y.domain()[0], this.y.domain()[1] + 1, labelValueGridSize)

    this.labels
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('font-size', this.labelFontSize)
      .attr('fill', ({ label }, index) => this._getColor(label, index))
      .attr('transform', ({ items }) => {
        // last (rightmost) value of the line
        const lastValue = items[items.length - 1].value
        let valueProximities = valueBuckets.map(value => Math.abs(lastValue - value))
        // index of the bucket the 'lastValue' falls into
        const bucketIndex = valueProximities.indexOf(d3.min(valueProximities) ?? -1)
        const clampedValue = bucketIndex < 0 ? lastValue : valueBuckets[bucketIndex]
        // mark value as "used" by setting it a value that we will probably never reach.
        valueBuckets[bucketIndex] = Number.MAX_SAFE_INTEGER

        return `translate(0, ${this.y(clampedValue)})`
      })
      .text(({ label }) => label)

    this._renderInteractionLayer()
  }

  _renderInteractionLayer(event) {
    if (!event) return

    let [mouseX, mouseY] = d3.pointer(event)

    const { width: linesContainerWidth } = this.lines.node().getBoundingClientRect()
    console.debug('_renderInteractionLayer', mouseX, mouseY)
    if (mouseX > linesContainerWidth + this.margin.left) {
      mouseX = linesContainerWidth + this.margin.left
    } else if (mouseX < this.margin.left) {
      mouseX = this.margin.left
    }

    this._lastMousePosition = [mouseX, mouseY]
    const currentMouseTimeValue = this.x.invert(mouseX)

    const positionData = this._interactionActive ? [currentMouseTimeValue] : []

    this.interaction
      .selectAll('line')
      .data(positionData)
      .join('line')
      .attr('stroke', '#ccc')
      .style('stroke-dasharray', '3, 3')
      .attr('pointer-events', 'none')
      .attr('x1', v => this.x(v))
      .attr('x2', v => this.x(v))
      .attr('y1', () => this.y.range()[0])
      .attr('y2', () => this.y.range()[1])

    const data = /** @type {ItemsSet[]} */ (this.lines.selectAll('g').data())

    const nearestItems = data.map(({ items, label }) => {
      const distances = items.map(({ time }) =>
        Math.abs(time.getTime() - currentMouseTimeValue.getTime())
      )
      const minDistance = /** @type {number} */ (d3.min(distances))
      const nearestIndex = distances.indexOf(minDistance)

      const nearestItem =
        nearestIndex < items.length ? items[nearestIndex] : items[items.length - 1]
      return { label, item: nearestItem }
    })

    this._lastNearestItems = nearestItems

    this.interaction
      .selectAll('circle')
      .data(this._interactionActive ? nearestItems : [])
      .join('circle')
      .attr('pointer-events', 'none')
      .attr(
        'transform',
        ({ item: { time, value } }) => `translate(${this.x(time)}, ${this.y(value)})`
      )
      .attr('r', 4)
      .attr('fill', ({ label }, index) => this._getColor(label, index))

    this.element.dispatchEvent(new CustomEvent('tooltip', { detail: this.tooltipData() }))
  }

  _getColor(label, index) {
    return this._lastColorPalette[label] || d3.schemeCategory10[index]
  }

  _getLabelElementHeightPixels() {
    // Get pixel size of a temporary text field. We will use it later to calculate
    // "snap to grid" vertical positions of labels so that they do not overlap.
    const textSizer = this.svg.append('text').attr('font-size', this.labelFontSize).text('_')

    const { height: textHeight } = textSizer.node().getBoundingClientRect()

    // remove the text field now as we got the size
    textSizer.remove()

    return textHeight
  }

  tooltipData() {
    const [x, y] = this._lastMousePosition

    return {
      x,
      y,
      isActive: this._interactionActive,
      item: {
        items: this._lastNearestItems,
        colors: this._lastNearestItems.map(({ label }, index) => this._getColor(label, index))
      }
    }
  }
}
