export const DefaultCoords = '0,0,200,200'

const HexColorRegex = /^([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i

interface Option<T> {
  default: T
  validate: (d: string) => boolean
  transform?: (d: string) => T
}

export const options = {
  backgroundColor: {
    default: 'transparent',
    validate: d => HexColorRegex.test(d),
    transform: d => `#${d}`
  } as Option<string>,
  backgroundSize: {
    default: 'normal',
    validate: d => ['contain', 'normal', 'cover'].includes(d)
  } as Option<string>,
  overlayBackgroundColor: {
    default: '#56ccf294',
    validate: d => HexColorRegex.test(d),
    transform: d => `#${d}`
  } as Option<string>,
  coords: {
    default: DefaultCoords,
    validate: d => /^\d{1,5},\d{1,5},\d{1,5},\d{1,5}$/.test(d)
  } as Option<string>,
  coordsMargin: {
    default: '50',
    validate: d => /^\d{1,4}$/.test(d)
  } as Option<string>,
  cssFilter: {
    default: [],
    validate: d =>
      [
        'contrast-0.5',
        'contrast-0.75',
        'contrast-1.5',
        'contrast-1.75',
        'brightness-0.5',
        'brightness-0.75',
        'brightness-1.5',
        'brightness-1.75',
        'brightness-2'
      ].includes(d),
    transform: d => d.split('-')
  } as Option<string[]>
}

type Options = typeof options
type OptionValue<K extends keyof Options> = Options[K] extends Option<infer T> ? T : never

/**
 * Returns the (transformed) value if valid, otherwise `defaultValue` or the option default.
 */
export function validateOrIgnore<K extends keyof Options, D = OptionValue<K>>(
  prop: K,
  value: unknown,
  defaultValue?: D
): OptionValue<K> | D {
  const option = options[prop] as Option<OptionValue<K>>
  if (typeof value === 'string' && option.validate(value)) {
    return option.transform ? option.transform(value) : (value as OptionValue<K>)
  }
  if (typeof defaultValue !== 'undefined') {
    return defaultValue
  }
  return option.default
}
