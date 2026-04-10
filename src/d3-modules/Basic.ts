import * as d3 from 'd3'
import EventEmitter from 'events'

interface Margin {
  top: number
  left: number
  bottom: number
  right: number
}

type DatumKey<TDatum extends object> = Extract<keyof TDatum, string>

interface UpdatableDimension<TDatum extends object> {
  update: (params: {
    property?: DatumKey<TDatum>
    values?: TDatum[]
    range?: number[]
  }) => void
}

type BasicDimensionsMap<TDatum extends object> = Record<string, UpdatableDimension<TDatum>>

interface BasicOptions<TDimensions extends BasicDimensionsMap<TDatum>, TDatum extends object> {
  svg?: d3.Selection<SVGSVGElement, TDatum, null, undefined> | null
  element?: Element | null
  dimensions: TDimensions
  margin?: Partial<Margin>
}

interface UpdateDimensionOptions<TName extends string, TDatum extends object> {
  name: TName
  property?: DatumKey<TDatum>
  values?: TDatum[]
  range?: number[]
}

export default class Basic<
  TDimensions extends BasicDimensionsMap<TDatum>,
  TDatum extends object = Record<string, unknown>
> extends EventEmitter {
  dimensions: TDimensions
  element: Element | null
  margin: Margin
  svg: d3.Selection<SVGSVGElement, TDatum, null, undefined>
  g: d3.Selection<SVGGElement, TDatum, null, undefined>
  width: number
  height: number

  constructor({
    svg = null,
    element = null,
    dimensions,
    margin = {}
  }: BasicOptions<TDimensions, TDatum>) {
    super()
    this.dimensions = dimensions
    this.element = element
    this.margin = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      ...margin
    }
    if (svg) {
      this.svg = svg
    } else {
      if (!element) {
        throw new Error('Basic requires either an `svg` selection or a host `element`.')
      }
      this.svg = d3
        .select<Element, TDatum>(element)
        .append<SVGSVGElement>('svg')
        .attr('preserveAspectRatio', 'none')
    }
    this.svg.on('click', () => {
      this.emit('svg.click')
    })

    this.g = this.svg.append<SVGGElement>('g').attr('class', 'm')
    this.emit('svg.init')
    // this.resize();
  }

  /**
   * Set the appropriate property and updete function range.
   * @param  {String} name key for this.dimensions object
   * @param  {String} property property name in datum
   * @param  {Array|Object} values Array or Object, according to Dimension type
   * @return {null}
   */
  updateDimension<K extends keyof TDimensions & string>({
    name,
    property,
    values,
    range
  }: UpdateDimensionOptions<K, TDatum>): void {
    this.dimensions[name].update({
      property,
      values,
      range
    })
    this.emit('dimension.updated', this.dimensions[name])
  }

  // getNearestValue(year) {
  //   const idx = d3.bisectLeft(this.values, year);
  //
  //   const d0 = this.values[idx - 1];
  //   const d1 = this.values[idx];
  //
  //   return Math.abs(year - d0) > Math.abs(year - d1) ? d1 : d0;
  // },
  /**
   * Set this.with and this.height;
   * then resize svg container.
   * using the given margin
   * @return {null}
   */
  resize(): void {
    let rect: DOMRect
    if (this.element) {
      rect = this.element.getBoundingClientRect()
    } else {
      const parent = this.svg.node()?.parentNode as Element | null
      rect = parent ? parent.getBoundingClientRect() : new DOMRect()
    }
    this.width = +rect.width
    this.height = +rect.height
    // set svg properties directly
    this.svg.attr('width', this.width).attr('height', this.height)

    this.emit('svg.resized')
  }
}
