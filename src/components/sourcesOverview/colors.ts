import { MediaSource } from '@/models/generated/canonical'
// Import from the sub-packages: smaller bundle than `from 'd3'`
import { hcl, rgb } from 'd3-color'
import { interpolateHcl, piecewise } from 'd3-interpolate'

export type RGB = [number, number, number]

const LUT_SIZE = 256

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

const toHcl = ([r, g, b]: RGB) => hcl(rgb(r, g, b))

/**
 * Creates a d3-style interpolator (t in [0, 1] -> CSS rgb string) between two colors.
 * t = 0 is `low`, t = 1 is `high`.
 *
 * Interpolates in HCL (perceptual) space, taking the shortest hue path, so low -> high
 * stays vivid instead of passing through muddy greys like an RGB mix would.
 *
 * Options:
 *  - `mid`: optional color forced at t = 0.5 (e.g. a saturated middle stop).
 *  - `midChromaBoost`: when no `mid` is given, the computed midpoint gets its chroma
 *    multiplied by (1 + boost) so the middle of the ramp doesn't look washed out.
 *    0 = plain HCL blend.
 *
 * The result is precomputed into a lookup table, so each call is just an array read.
 */
export const createRgbInterpolator = (
  low: RGB,
  high: RGB,
  { mid, midChromaBoost = 0.1 }: { mid?: RGB; midChromaBoost?: number } = {}
) => {
  const lo = toHcl(low)
  const hi = toHcl(high)

  let midStop: ReturnType<typeof toHcl>
  if (mid) {
    midStop = toHcl(mid)
  } else {
    midStop = hcl(interpolateHcl(lo, hi)(0.5))
    midStop.c *= 1 + midChromaBoost
  }

  // interpolateHcl already returns clamped CSS `rgb(...)` strings
  const ramp = piecewise(interpolateHcl, [lo, midStop, hi])
  const lut = Array.from({ length: LUT_SIZE }, (_, i) => ramp(i / (LUT_SIZE - 1)))

  return (t: number) => lut[Math.round(clamp01(t) * (LUT_SIZE - 1))]
}

// light -> dark purple
export const RadioLow = [196, 34, 169] as RGB
export const RadioHigh = [99, 69, 143] as RGB
// light -> dark cyan/blue
export const NewspaperLow = [0, 165, 207] as RGB
export const NewspaperHigh = [0, 126, 204] as RGB
export const interpolatorForRadio = createRgbInterpolator(RadioLow, RadioHigh)
// light -> dark cyan/blue
export const interpolatorForNewspapers = createRgbInterpolator(NewspaperLow, NewspaperHigh)

export const getColorScaleFnBySourceType = (sourceType: MediaSource['type']) =>
  sourceType === 'newspaper' ? interpolatorForNewspapers : interpolatorForRadio
