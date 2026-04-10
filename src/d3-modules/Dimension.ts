import * as d3 from 'd3'

const TYPE_DISCRETE = 'TYPE_DISCRETE'
const TYPE_CONTINUOUS = 'TYPE_CONTINUOUS'

type DimensionValue = string | d3.NumberValue | null | undefined
type DatumKey<TDatum extends object> = Extract<keyof TDatum, string>

interface DiscreteScale {
  (value: string): string
  domain(): string[]
  domain(values: Iterable<string>): this
  range(): string[]
  range(values: Iterable<string>): this
}

interface ContinuousScale extends d3.AxisScale<d3.NumberValue> {
  (value: d3.NumberValue): number
  domain(): d3.NumberValue[]
  domain(values: Iterable<d3.NumberValue>): this
  range(): number[]
  range(values: Iterable<number>): this
  invert(value: number): d3.NumberValue
}

interface PowerContinuousScale extends ContinuousScale {
  exponent(): number
  exponent(value: number): this
}

type DimensionScale = DiscreteScale | ContinuousScale
type ContinuousScaleFactory =
  | typeof d3.scaleLinear
  | typeof d3.scalePow
  | typeof d3.scaleSqrt
  | typeof d3.scaleTime
type DiscreteScaleFactory = typeof d3.scaleOrdinal
type ScaleFactory = ContinuousScaleFactory | DiscreteScaleFactory

interface DimensionConstructorParams<TDatum extends object> {
  name?: string
  type?: string
  property: DatumKey<TDatum>
  scaleFn: ScaleFactory
  domain?: DimensionValue[]
  range?: number[]
  isRangeFixed?: boolean
  exponent?: number
  isScalePow?: boolean
  discreteColorSchemeName?: string
  autoCalculateDomain?: boolean
}

interface DimensionDomainParams {
  domain?: DimensionValue[]
  fixed?: boolean
}

interface DimensionUpdateParams<TDatum extends object> {
  property?: DatumKey<TDatum>
  values?: TDatum[]
  range?: number[]
}

class Dimension<TDatum extends object> {
  static TYPE_DISCRETE = TYPE_DISCRETE
  static TYPE_CONTINUOUS = TYPE_CONTINUOUS

  name: string
  property: DatumKey<TDatum>
  type: string
  scaleFn: ScaleFactory
  domain: DimensionValue[]
  range: number[]
  isRangeFixed: boolean
  isScalePow: boolean
  exponent: number
  autoCalculateDomain: boolean
  discreteColorsSchemeName: string
  discreteColors: string[]
  scale: DimensionScale
  values: DimensionValue[] | undefined
  legend: Array<{
    name: string
    property: DatumKey<TDatum>
    count: number
    color: string
  }>

  constructor({
    name = '',
    type = '',
    property,
    scaleFn,
    domain = [0, 1],
    range = [0, 1],
    isRangeFixed = false,
    exponent = 2, // only for scaleFn scalePow
    isScalePow = false,
    discreteColorSchemeName = 'Warm',
    autoCalculateDomain = true
  }: DimensionConstructorParams<TDatum>) {
    this.name = name
    this.property = property
    this.type = type
    // if(this.type === )
    this.scaleFn = scaleFn
    this.domain = domain
    this.range = range
    this.isRangeFixed = isRangeFixed
    this.isScalePow = isScalePow
    this.exponent = exponent
    this.autoCalculateDomain = autoCalculateDomain
    this.discreteColors = []
    this.legend = []
    this.discreteColorsSchemeName = discreteColorSchemeName
    if (this.type === TYPE_DISCRETE) {
      this.updateDiscreteColors(this.discreteColorsSchemeName)
      this.scale = this.createDiscreteScale()
    } else {
      this.scale = this.createContinuousScale()
    }
  }

  private createDiscreteScale(): DiscreteScale {
    const factory = this.scaleFn as DiscreteScaleFactory
    const discreteDomain = this.domain.filter((value): value is string => typeof value === 'string')
    return factory<string, string>(this.discreteColors).domain(discreteDomain)
  }

  private createContinuousScale(): ContinuousScale {
    const factory = this.scaleFn as unknown as () => ContinuousScale
    const continuousDomain = this.domain.filter(
      (value): value is number | Date => typeof value === 'number' || value instanceof Date
    )
    const scale = factory() as ContinuousScale
    const scaleWithDomain = scale.domain(continuousDomain)
    const scaleWithRange = scaleWithDomain.range(this.range)
    if (this.isScalePow && 'exponent' in scaleWithRange) {
      return (scaleWithRange as unknown as PowerContinuousScale).exponent(this.exponent)
    }
    return scaleWithRange
  }

  private static isContinuousScale(scale: DimensionScale): scale is ContinuousScale {
    return 'invert' in scale
  }

  getContinuousScale(): ContinuousScale {
    if (Dimension.isContinuousScale(this.scale)) {
      return this.scale
    }
    throw new Error(`Dimension "${this.name}" is discrete and has no continuous scale.`)
  }

  updateDiscreteColors(discreteColorSchemeName: string): void {
    const d3Any = d3 as unknown as Record<string, unknown>
    console.info('dimension', discreteColorSchemeName)
    const scheme = d3Any[`scheme${discreteColorSchemeName}`] as string[][] | undefined
    const interpolate = d3Any[`interpolate${discreteColorSchemeName}`] as
      | ((t: number) => string)
      | undefined

    if (
      scheme &&
      Array.isArray(this.domain) &&
      Number.isFinite(this.domain.length) &&
      scheme[this.domain.length]
    ) {
      this.discreteColors = scheme[this.domain.length]
    } else if (interpolate) {
      this.discreteColors = []
      for (let i = 0; i < this.domain.length; ++i) {
        this.discreteColors.push(d3.rgb(interpolate(i / (this.domain.length - 1))).hex())
      }
    }
  }
  /**
   * getNearestValue
   * @param  {Number} v [description]
   * @return {Object}   [description]
   */
  getNearestValue(v: d3.NumberValue | string): { index: number; nearest: DimensionValue } {
    if (!this.values) {
      console.warn('this.values not set in dimension, do update() before calling getNearestValue')
      return {
        index: -1,
        nearest: null
      }
    }

    let idx = 0
    if (v instanceof Date) {
      idx = d3.bisectLeft(this.values as Date[], v)
    } else if (typeof v === 'string') {
      idx = d3.bisectLeft(this.values as string[], v)
    } else {
      idx = d3.bisectLeft(this.values as number[], Number(v))
    }

    if (idx === 0) {
      return {
        index: 0,
        nearest: this.values[0]
      }
    }

    const d0 = this.values[idx - 1]
    const d1 = this.values[idx]

    const comparableValue = Number(v)

    if (Math.abs(comparableValue - Number(d0)) > Math.abs(comparableValue - Number(d1))) {
      return {
        index: idx,
        nearest: d1
      }
    }
    return {
      index: idx - 1,
      nearest: d0
    }
  }

  setDomain({ domain = [], fixed = true }: DimensionDomainParams = {}): void {
    if (!domain.length) {
      return
    }
    this.domain = domain
    this.autoCalculateDomain = !fixed
    this.scale = this.createContinuousScale()
  }
  /**
   * If type is TYPE_CONTINUOUS, values should be a flattened array of values
   * so that the min/max extent for the domain can easily be computated.
   *
   * @param  {[type]} property [description]
   * @param  {[type]} values   [description]
   * @return {[type]}          [description]
   */
  update({ property, values = [], range }: DimensionUpdateParams<TDatum> = {}): void {
    this.values = values.map(d => d[this.property] as DimensionValue)
    if (property) {
      this.property = property
    }
    if (this.range && range) {
      this.range = range
    }
    if (this.autoCalculateDomain && Array.isArray(values) && this.type !== TYPE_DISCRETE) {
      this.domain = d3.extent(values, d => d[this.property] as d3.NumberValue)
    }
    this.legend = []
    // recalculate cat according to type
    if (this.type === TYPE_DISCRETE) {
      try {
        if (!Array.isArray(values)) return

        const groups = Dimension.groupBy(values, this.property)
        this.domain = Object.keys(groups)
        this.updateDiscreteColors(this.discreteColorsSchemeName)
        this.scale = this.createDiscreteScale()
        this.domain.forEach(key => {
          const keyString = String(key)
          const discreteScale = this.scale as DiscreteScale
          this.legend.push({
            name: keyString,
            property: this.property,
            count: groups[keyString].length,
            color: String(discreteScale(keyString))
          })
        })
      } catch (e) {
        console.error(
          'Dimension.update(TYPE_DISCRETE) failed for:',
          this.property,
          '\n- error:',
          e,
          '\n- values:',
          values
        )
      }
    } else {
      this.scale = this.createContinuousScale()
    }
  }

  accessor(): (d: TDatum) => number {
    return d => {
      if (this.type === TYPE_DISCRETE) {
        const discreteScale = this.scale as DiscreteScale
        return Number(discreteScale(String(d[this.property])))
      }
      const continuousScale = this.scale as ContinuousScale
      return continuousScale(d[this.property] as d3.NumberValue)
    }
  }

  /**
   * Group cateogories
   * @param  {Array} arr      [description]
   * @param  {String} property [description]
   * @return {Object} groups
   */
  static groupBy<TData extends object>(
    arr: TData[],
    property: DatumKey<TData>
  ): Record<string, TData[]> {
    return arr.reduce(
      (acc, obj) => {
        const key = String(obj[property] as unknown)
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(obj)
        return acc
      },
      {} as Record<string, TData[]>
    )
  }
}

export default Dimension
