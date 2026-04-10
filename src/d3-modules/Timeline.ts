import * as d3 from 'd3'
import Line from './Line'
import type { LineDimensions } from './Line'
import Dimension from './Dimension'

interface TimelineDatum {
  [key: string]: any
  t?: Date | string | number
}

interface TimelineOptions {
  element?: Element | null
  svg?: d3.Selection<SVGSVGElement, TimelineDatum, null, undefined> | null
  margin?: Record<string, number>
  format?: string
  domain?: Array<string | number | Date>
  brushable?: boolean
  brushFormat?: string
  dimensions?: Partial<LineDimensions<TimelineDatum>> & Record<string, any>
  contextPeakTextFn?: (value: any) => any
}

interface BrushedEvent {
  sourceEvent?: Event
  selection?: [number, number] | null
  type: string
}

interface BrushToPayload {
  min: string | number | Date
  max: string | number | Date
}

interface UpdateOptions {
  data?: TimelineDatum[]
}

export default class Timeline extends Line<TimelineDatum> {
  [key: string]: any

  timeFormat: any
  timeParse: any
  contextPeakTextFn: (value: any) => any

  constructor({
    element = null,
    svg = null,
    margin = {},
    format = '%Y',
    domain = [],
    brushable = false,
    brushFormat = '%Y-%m-%d',
    dimensions = {
      x: new Dimension<TimelineDatum>({
        name: 'x',
        property: 't',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scaleTime
      }),
      y: new Dimension<TimelineDatum>({
        name: 'y',
        property: 'w',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scalePow,
        exponent: 1,
        isScalePow: true
      })
    },
    contextPeakTextFn = d => d
  }: TimelineOptions = {}) {
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
      dimensions
    })

    this.timeFormat = d3.timeFormat(format)
    this.timeParse = d3.timeParse(format)
    this.contextAxisX = this.context.append('g').attr('class', 'axis axis--x')
    if (domain.length) {
      this.dimensions.x.setDomain({
        domain: domain.map(d => (d instanceof Date ? d : this.timeParse(String(d))))
      })
    }
    this.contextPeak = this.context.append('g').attr('class', 'peak')
    this.contextPeak.append('circle').attr('r', 2).attr('class', 'peak-pointer')
    this.contextPeakText = this.contextPeak
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
    this.contextPeakTextFn = contextPeakTextFn
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

  brushed(event: BrushedEvent): void {
    if (event.sourceEvent) {
      const xScale = this.dimensions.x.getContinuousScale()
      const ordered = event.selection
      const { type } = event

      if (!ordered) {
        this.emit('clear-selection')
        return
      }

      this.brushedMinDate = xScale.invert(ordered[0])
      this.brushedMaxDate = xScale.invert(ordered[1])
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

  brushTo({ min, max }: BrushToPayload): void {
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
        min instanceof Date ? min : this.brushTimeParse(String(min)),
        max instanceof Date ? max : this.brushTimeParse(String(max))
      ]
      if (this.contextBrush) {
        const xScale = this.dimensions.x.getContinuousScale()
        this.contextBrush.call(this.brush.move, [
          xScale(to[0]),
          xScale(to[1])
        ])
      }
    }, 150)
  }

  draw(): void {
    super.draw()
    const xScale = this.dimensions.x.getContinuousScale()
    this.xAxis2 = d3.axisBottom(xScale).tickFormat(this.timeFormat)
    this.contextAxisX.call(this.xAxis2)
    this.contextAxisX.attr(
      'transform',
      `translate(0,${this.height - this.margin.bottom - this.margin.top})`
    )
    // where is the first maximum peak?
    if (this.maxDatum) {
      const xmax = xScale(this.maxDatum[this.dimensions.x.property] as d3.NumberValue)
      this.contextPeak.attr('transform', `translate(${xmax},0)`)
      this.contextPeakText.text(this.contextPeakTextFn(this.maxDatum[this.dimensions.y.property]))
    }
    // this.contextPeak.attr('transform',
    //
    // ``)
  }

  /**
   * Ensure we deal with dates
   * @param  {Array}  [data=[]               } = {}] [description]
   * @param {Array}  [domain=[]             } = {}] [description]
   * @return {[type]}          [description]
   */
  update({ data = [] }: UpdateOptions = {}): void {
    super.update({
      data: data.map(d => ({
        ...d,
        t: d.t instanceof Date ? d.t : this.timeParse(String(d.t))
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

  updateTimeFormat(format: string): void {
    this.timeFormat = d3.timeFormat(format)
    this.timeParse = d3.timeParse(format)
  }

  /**
   * Highlight current datum if any
   * @param  {[type]} datum [description]
   * @return {[type]}       [description]
   */
  highlight(datum: TimelineDatum | null | undefined): void {
    if (datum) {
      super.highlight({
        ...datum,
        t: datum.t instanceof Date ? datum.t : this.timeParse(String(datum.t))
      })
    }
  }
}
