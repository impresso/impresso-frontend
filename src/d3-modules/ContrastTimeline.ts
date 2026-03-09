import * as d3 from 'd3'
import Timeline from './Timeline'
import Dimension from './Dimension'

interface ContrastTimelineOptions {
  element?: Element | null
  svg?: d3.Selection<SVGSVGElement, any, null, undefined> | null
  margin?: Record<string, number>
  format?: string
  domain?: Array<string | number | Date>
  dimensions?: Record<string, any>
  contextPeakTextFn?: (value: any) => any
}

interface ContrastDatum {
  [key: string]: unknown
  w1?: number
}

interface PointerCoordinates {
  x: number
  y: number
}

interface MovePointerPayload {
  pointer: PointerCoordinates
  datum: ContrastDatum
}

interface UpdatePayload {
  data?: ContrastDatum[]
}

export default class ContrastTimeline extends Timeline {
  declare context: d3.Selection<SVGGElement, unknown, null, undefined>
  declare data: ContrastDatum[]
  declare height: number
  declare margin: { top: number; left: number; bottom: number; right: number } & Record<
    string,
    number
  >
  declare contextAreaContrast: d3.Selection<SVGPathElement, unknown, null, undefined>
  declare contextPointerContrast: d3.Selection<SVGCircleElement, unknown, null, undefined>
  declare curveContrast: d3.Line<any>

  constructor({
    element = null,
    svg = null,
    margin = {},
    format = '%Y',
    domain = [],
    dimensions = {},
    contextPeakTextFn = d => d
  }: ContrastTimelineOptions = {}) {
    super({
      element,
      svg,
      format,
      margin,
      domain,
      dimensions,
      contextPeakTextFn
    })

    this.dimensions.contrast = new Dimension<ContrastDatum>({
      name: 'contrast',
      property: 'w1',
      type: Dimension.TYPE_CONTINUOUS,
      scaleFn: d3.scaleLinear
    })

    this.contextAreaContrast = this.context.append('path').attr('class', 'area contrast')

    this.contextPointerContrast = this.context
      .append('circle')
      .attr('r', 3)
      .attr('class', 'pointer contrast')

    this.on('mousemove', this.movePointer)
    this.on('highlighted', this.movePointer)
  }

  movePointer({ pointer, datum }: MovePointerPayload): void {
    const datumValue = Number(datum[this.dimensions.contrast.property] ?? 0)
    const pointerY = this.dimensions.contrast.scale(datumValue)
    this.contextPointerContrast
      .classed('active', true)
      .attr('transform', `translate(${pointer.x},${pointerY})`)
  }

  draw(): void {
    super.draw()
    // setup curve
    this.curveContrast = d3
      .line<ContrastDatum>()
      .curve(d3.curveLinear)
      .x(this.dimensions.x.accessor())
      .y(this.dimensions.contrast.accessor())

    this.contextAreaContrast.datum(this.data).attr('d', this.curveContrast)
  }

  update({ data = [] }: UpdatePayload = {}): void {
    super.update({
      data
    })
    console.info('update contrast dimension', this.dimensions.y.domain)
    this.dimensions.contrast.setDomain({
      domain: this.dimensions.y.domain
    })
    this.dimensions.contrast.update({
      values: data,
      domain: this.dimensions.y.domain,
      range: [this.height - this.margin.top - this.margin.bottom, 0]
    })
  }

  mouseenter(): void {
    this.contextPointerContrast.classed('active', true)
    super.mouseenter()
  }

  mouseleave(): void {
    this.contextPointerContrast.classed('active', false)
    super.mouseleave()
  }
}
