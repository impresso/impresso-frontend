import * as d3 from 'd3'
import Basic from './Basic'
import Dimension from './Dimension'

export default class Line extends Basic {
  constructor({
    element = null,
    svg = null,
    margin = {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10
    },
    ticks = {
      offset: 9
    },
    dimensions = {}
  } = {}) {
    super({
      element,
      svg,
      margin,
      dimensions: {
        x: new Dimension({
          name: 'x',
          property: 'x',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleLinear
        }),
        y: new Dimension({
          name: 'y',
          property: 'y',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleLinear
        }),
        ...dimensions
      }
    })
    this.ticks = ticks
    // setup main context
    this.context = this.g
      .append('g')
      .classed('context', true)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    this.contextBackground = this.context.append('rect')

    this.contextArea = this.context.append('path').attr('class', 'area')
    this.contextCurve = this.context.append('path').attr('class', 'curve')

    this.contextPointer = this.context.append('circle').attr('r', 3).attr('class', 'pointer')

    this.context.on('mousemove', this.mousemove.bind(this))
    this.context.on('mouseenter', this.mouseenter.bind(this))
    this.context.on('mouseleave', this.mouseleave.bind(this))
    this.resize()
  }

  mouseenter() {
    this.contextPointer.classed('active', true)
    this.emit('mouseenter')
  }

  mouseleave() {
    this.contextPointer.classed('active', false)
    this.emit('mouseleave')
  }

  highlight(datum) {
    if (datum) {
      const { index, nearest } = this.dimensions.x.getNearestValue(
        datum[this.dimensions.x.property]
      )
      if (nearest) {
        const pointerX = this.dimensions.x.scale(nearest)
        const pointerY = this.dimensions.y.scale(this.data[index][this.dimensions.y.property])

        this.contextPointer
          .classed('active', true)
          .attr('transform', `translate(${pointerX},${pointerY})`)

        this.emit('highlighted', {
          pointer: {
            x: pointerX,
            y: pointerY
          },
          datum: this.data[index]
        })
      }
    }
  }

  mousemove(a, b, el) {
    const [mouseX, mouseY] = d3.mouse(el[0])
    const scaledX = this.dimensions.x.scale.invert(mouseX)
    const { index, nearest } = this.dimensions.x.getNearestValue(scaledX)

    if (index === -1) return
    if (index < 0 || index >= this.data.length) return

    const pointerX = this.dimensions.x.scale(nearest)
    const pointerY = this.dimensions.y.scale(this.data[index][this.dimensions.y.property])

    this.contextPointer.attr('transform', `translate(${pointerX},${pointerY})`)

    this.emit('mousemove', {
      mouse: {
        x: mouseX,
        y: mouseY
      },
      pointer: {
        x: pointerX,
        y: pointerY
      },
      datum: this.data[index]
    })
  }

  resize() {
    super.resize()
    // update dimension range
    if (this.data) {
      this.draw()
    }
  }
  /**
   * Update with data array.
   *
   * @param  {Array}  [data=[]] For this, required at least
   * @return {[type]}           [description]
   */
  update({ data = [] } = {}) {
    this.data = data
    // console.info('update line', data);
    this.dimensions.x.update({
      values: data,
      range: [0, this.width - this.margin.left - this.margin.right]
    })
    this.dimensions.y.update({
      values: data,
      range: [this.height - this.margin.top - this.margin.bottom, 0]
    })
  }

  draw() {
    this.contextBackground
      .attr('width', this.width - this.margin.right - this.margin.left)
      .attr('height', this.height - this.margin.bottom - this.margin.top)

    // setup curve
    this.curve = d3
      .line()
      .curve(d3.curveLinear)
      .x(this.dimensions.x.accessor())
      .y(this.dimensions.y.accessor())

    // setup area
    this.area = d3
      .area()
      .x(this.dimensions.x.accessor())
      .y0(this.height - this.margin.bottom - this.ticks.offset)
      .y1(this.dimensions.y.accessor())

    this.contextCurve.datum(this.data).attr('d', this.curve)
    this.contextArea.datum(this.data).attr('d', this.area)
  }
}
