import * as d3 from 'd3'
import Line from './Line'
import Dimension from './Dimension'

export default class Timeline extends Line {
  constructor({
    element = null,
    svg = null,
    margin = {},
    format = '%Y',
    domain = [],
    brushable = false,
    brushFormat = '%Y-%m-%d'
  } = {}) {
    super({
      element,
      svg,
      margin: {
        top: 15,
        bottom: 20,
        left: 10,
        right: 10,
        ...margin
      },
      ticks: {
        offset: 9
      },
      dimensions: {
        x: new Dimension({
          name: 'x',
          property: 't',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleTime
        }),
        y: new Dimension({
          name: 'y',
          property: 'w',
          type: Dimension.TYPE_CONTINUOUS,
          scaleFn: d3.scaleLinear
        })
      }
    })

    this.timeFormat = d3.timeFormat(format)
    this.timeParse = d3.timeParse(format)
    this.contextAxisX = this.context.append('g').attr('class', 'axis axis--x')
    if (domain.length) {
      this.dimensions.x.setDomain({
        domain: domain.map(d => this.timeParse(d))
      })
    }
    this.contextPeak = this.context.append('g').attr('class', 'peak')
    this.contextPeak.append('circle').attr('r', 2).attr('class', 'peak-pointer')
    this.contextPeakText = this.contextPeak
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)

    this.brushable = brushable
    if (brushable) {
      this.brushFormat = brushFormat
      this.brushTimeFormat = d3.timeFormat(brushFormat)
      this.brushTimeParse = d3.timeParse(brushFormat)
      this.brush = d3.brushX().on('brush end', this.brushed.bind(this))
      this.contextBrush = this.context.append('g').attr('class', 'brush').call(this.brush)

      this.on('svg.resized', () => {
        this.brush.extent([
          [0, 0],
          [
            this.width - this.margin.right - this.margin.left,
            this.height - this.margin.bottom - this.ticks.offset
          ]
        ])
        this.contextBrush.call(this.brush)
      })
    }
  }

  brushed(event) {
    if (event.sourceEvent) {
      const ordered = event.selection
      const { type } = event

      if (!ordered) {
        this.emit('clear-selection')
        return
      }

      this.brushedMinDate = this.dimensions.x.scale.invert(ordered[0])
      this.brushedMaxDate = this.dimensions.x.scale.invert(ordered[1])
      this.brushedMinValue = this.brushTimeFormat(this.brushedMinDate)
      this.brushedMaxValue = this.brushTimeFormat(this.brushedMaxDate)

      const eventPayload = {
        brush: {
          min: ordered[0],
          max: ordered[1]
        },
        minDate: this.brushedMinDate,
        maxDate: this.brushedMaxDate,
        minValue: this.brushedMinValue,
        maxValue: this.brushedMaxValue
      }

      this.emit('brushed', eventPayload)

      if (type === 'end') this.emit('brush-end', eventPayload)
    }
    // else console.info('@brushed called from outside, no need to emit brushes');
  }

  brushTo({ min, max }) {
    if (!min || !max) {
      return
    }
    if (this.brushedMinValue === min && this.brushedMaxValue === max) {
      return
    }
    if (this.brushDebounceTimer) {
      clearTimeout(this.brushDebounceTimer)
    }

    this.brushDebounceTimer = setTimeout(() => {
      if (!this.contextBrush) {
        return
      }
      const to = [
        min instanceof Date ? min : this.brushTimeParse(min),
        max instanceof Date ? max : this.brushTimeParse(max)
      ]
      if (this.contextBrush) {
        this.contextBrush.call(this.brush.move, [
          this.dimensions.x.scale(to[0]),
          this.dimensions.x.scale(to[1])
        ])
      }
    }, 150)
  }

  draw() {
    super.draw()
    this.xAxis2 = d3.axisBottom(this.dimensions.x.scale).tickFormat(this.timeFormat)
    this.contextAxisX.call(this.xAxis2)
    this.contextAxisX.attr(
      'transform',
      `translate(0,${this.height - this.margin.bottom - this.margin.top})`
    )
    // where is the first maximum peak?
    if (this.maxDatum) {
      const xmax = this.dimensions.x.scale(this.maxDatum[this.dimensions.x.property])
      this.contextPeak.attr('transform', `translate(${xmax},0)`)
      this.contextPeakText.text(this.maxDatum[this.dimensions.y.property])
    }
    // this.contextPeak.attr('transform',
    //
    // ``)
  }

  /**
   * Ensure we deal with dates
   * @param  {Array}  [data=[]               } = {}] [description]
   * @return {[type]}          [description]
   */
  update({ data = [] } = {}) {
    super.update({
      data: data.map(d => ({
        ...d,
        t: d.t instanceof Date ? d.t : this.timeParse(d.t)
      }))
    })
    // idx of this data where the y value is at its maximum
    const ymaxIdx = this.data.findIndex(
      d => d[this.dimensions.y.property] >= this.dimensions.y.domain[1]
    )
    if (ymaxIdx > -1) {
      this.maxDatum = this.data[ymaxIdx]
    }
  }

  updateTimeFormat(format) {
    this.timeFormat = d3.timeFormat(format)
    this.timeParse = d3.timeParse(format)
  }

  /**
   * Highlight current datum if any
   * @param  {[type]} datum [description]
   * @return {[type]}       [description]
   */
  highlight(datum) {
    if (datum) {
      super.highlight({
        ...datum,
        t: datum.t instanceof Date ? datum.t : this.timeParse(datum.t)
      })
    }
  }
}
