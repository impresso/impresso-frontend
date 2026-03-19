<template>
  <div class="HistogramSlider">
    <div ref="maxValueLabel" class="HistogramSlider__maxValueLabel position-absolute very-small">
      <template v-if="maxBucket && bucketSpan > 0">
        <span
          v-if="maxBucket.lower !== maxBucket.upper"
          v-html="
            $t('maxvalrange', {
              lower: maxBucket.lower,
              upper: maxBucket.upper,
              n: maxBucket.count
            })
          "
        ></span>
        <span
          v-else
          v-html="
            $t('maxval', {
              val: maxBucket.value,
              n: maxBucket.count
            })
          "
        ></span>
      </template>
      <span
        v-else-if="maxBucket"
        v-html="$t('maxval', { val: maxBucket.value, n: maxBucket.count })"
      ></span>
    </div>
    <div ref="chartContainer" class="position-relative">
      <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
      <Tooltip v-if="showTooltip && tooltipState.isActive" :tooltip="tooltipState">
        <template v-if="tooltipState.bucket">
          <template
            v-if="bucketSpan > 0 && tooltipState.bucket.lower !== tooltipState.bucket.upper"
          >
            {{
              $t('valRange', {
                lower: tooltipState.bucket.lower,
                upper: tooltipState.bucket.upper,
                n: tooltipState.bucket.count
              })
            }}
          </template>
          <span v-else>
            {{ $t('val', { val: tooltipState.bucket.value, n: tooltipState.bucket.count }) }}
          </span>
        </template>
      </Tooltip>
    </div>
    <div v-if="shouldEnableSlider">
      <VueSlider
        width="100%"
        v-model="sliderValue"
        v-bind="{
          modelValue: [sliderValue[0], sliderValue[1]],
          min: sliderRange[0],
          max: sliderRange[1]
        }"
        :tooltip-formatter="$n"
        :tooltip-placement="onlyRangeLabels ? 'bottom' : 'top'"
        data-testid="slider-control"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * NOTE: Only works with integers. If you need fractions, normalise them first.
 */
import Bucket from '@/models/Bucket'
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import VueSlider from 'vue-3-slider-component'
import Tooltip from '../tooltips/Tooltip.vue'

type TooltipState = {
  x: number
  y: number
  isActive: boolean
  bucket: Bucket | null
}

export interface HistogramSliderProps {
  modelValue?: number[]
  range?: number[]
  buckets?: Bucket[]
  chartHeight?: number
  onlyRangeLabels?: boolean
  scaleType?: 'linear' | 'sqrt' | 'symlog'
  valueLabel?: string
  showTooltip?: boolean
  marginTop?: number
}

const props = withDefaults(defineProps<HistogramSliderProps>(), {
  chartHeight: 50,
  onlyRangeLabels: false,
  scaleType: 'linear',
  valueLabel: 'valueLabel',
  showTooltip: false,
  marginTop: 20
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[] | undefined): void
  (e: 'change', value: number[] | undefined): void
  (e: 'mousemove', value: { pointer: { x: number; y: number }; bucket: Bucket } | null): void
  (e: 'click', value: { bucket: Bucket }): void
}>()

// Template refs
const chartContainer = ref<HTMLElement | (ComponentPublicInstance & { $el: HTMLElement }) | null>(
  null
)
const chart = ref<SVGSVGElement | null>(null)
const maxValueLabel = ref<HTMLElement | null>()
// State
const tooltipState = ref<TooltipState>({
  x: 0,
  y: 50,
  isActive: false,
  bucket: null
})

// Helpers
function getChartContainerEl(): HTMLElement | null {
  const el = chartContainer.value
  if (!el) return null
  return el instanceof HTMLElement ? el : (el as ComponentPublicInstance & { $el: HTMLElement }).$el
}

// Computed
const sliderRange = computed<[number, number] | undefined>(() => {
  const buckets = props.buckets ?? []

  // Helper: derive a fallback range from props.range or modelValue
  const fallbackRange = (): [number, number] | undefined => {
    if (props.range != null && props.range.length === 2) {
      const [r0, r1] = props.range
      return [r0, r1]
    }
    if (props.modelValue != null && props.modelValue.length === 2) {
      const [v0, v1] = props.modelValue
      if ([v0, v1].every(n => typeof n === 'number' && !isNaN(n) && isFinite(n))) {
        return [Math.min(v0, v1), Math.max(v0, v1)]
      }
    }
    return undefined
  }

  if (!buckets.length) {
    return fallbackRange()
  }

  const vals = buckets
    .map(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
    .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v))

  if (!vals.length) {
    return fallbackRange()
  }

  const min = Math.min(...vals)
  const max = Math.max(...vals)

  if (props.range == null || props.range.length !== 2) {
    return [min, max]
  }

  const [r0, r1] = props.range
  return [Math.min(min, r0), Math.max(max, r1)]
})

const sliderValue = computed<number[] | undefined>({
  get() {
    if (props.modelValue?.length === 2) {
      return props.modelValue
    }
    return sliderRange.value
  },
  set(value?: number[]) {
    emit('change', value)
    emit('update:modelValue', value)
  }
})

const shouldEnableSlider = computed(() => {
  const range = sliderRange.value
  const value = sliderValue.value

  if (!range || !value || range.length !== 2 || value.length !== 2) {
    return false
  }

  const [min, max] = range
  const [v0, v1] = value

  return [min, max, v0, v1].every(
    n => typeof n === 'number' && !isNaN(n) && isFinite(n)
  )
})
/**
 * The bucket with the maximum count, used for annotating the chart with the max value.
 * it is computed with the bucket bounds (lower and upper) for display purposes, based on the bucket span.
 */
const maxBucket = computed<Bucket | null>(() => {
  const maxCount = Math.max(...parsedBuckets.value.map(({ count }) => count))
  const index = parsedBuckets.value.findIndex(d => d.count === maxCount)
  return parsedBuckets.value[index] ?? null
})

/**
 * Add lower and upper bounds to buckets, based on the bucket values and the span between them.
 * This is used for displaying the max value label as a range when there are multiple buckets with
 */
const parsedBuckets = computed<(Bucket & { lower: number; upper: number })[]>(() => {
  const buckets = props.buckets ?? []
  const span = bucketSpan.value
  return buckets.map((bucket, index) => {
    const value =
      typeof bucket.value === 'string' ? parseInt(bucket.value, 10) : (bucket.value as number)

    // Preserve existing lower/upper bounds when provided (e.g., dynamic-range facets).
    const existingLower = (bucket as any).lower
    const existingUpper = (bucket as any).upper
    const hasExistingBounds =
      typeof existingLower === 'number' && typeof existingUpper === 'number'

    if (hasExistingBounds) {
      return {
        ...(bucket as any),
        value,
        lower: existingLower,
        upper: existingUpper
      } as Bucket & { value: number; lower: number; upper: number }
    }

    const lower = value
    const upper = index === buckets.length - 1 ? value : value + span - 1
    return { ...(bucket as any), value, lower, upper } as Bucket & {
      value: number
      lower: number
      upper: number
    }
  }) as (Bucket & { value: number; lower: number; upper: number })[]
})
/**
 * The span between bucket values, used to bet lower / upper bounds.
 */
const bucketSpan = computed<number>(() => {
  const buckets = props.buckets ?? []
  if (buckets.length < 2) return 0
  const valueBucket0 =
    typeof buckets[0].value === 'string' ? parseInt(buckets[0].value, 10) : buckets[0].value
  const valueBucket1 =
    typeof buckets[1].value === 'string' ? parseInt(buckets[1].value, 10) : buckets[1].value
  return Math.abs(valueBucket1 - valueBucket0)
})

// Chart rendering
function renderChart(): void {
  const buckets = parsedBuckets.value
  if (!buckets?.length) return

  const containerEl = getChartContainerEl()
  const chartEl = chart.value
  if (!containerEl || !chartEl) return
  const { width } = containerEl.getBoundingClientRect()
  const height = props.chartHeight

  const svg = d3.select(chartEl).attr('width', width).attr('height', height)

  // Clear previous render
  svg.selectAll('*').remove()

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(buckets.map(({ value }) => String(value)))
    .range([0, width])
    .paddingInner(0.05)

  const counts = buckets.map(({ count }) => count)
  const yScaler = { linear: d3.scaleLinear(), sqrt: d3.scaleSqrt(), symlog: d3.scaleSymlog() }[
    props.scaleType ?? 'linear'
  ]
  const y = yScaler
    .domain([Math.min(...counts), Math.max(...counts)])
    .range([0, height - props.marginTop])

  const maxCount = Math.max(...counts)

  // Bars group
  const barsGroup = svg.append('g').attr('class', 'bars')

  barsGroup
    .selectAll<SVGGElement, Bucket>('g.bar')
    .data(buckets)
    .join('g')
    .attr('class', d => `bar${d.count === maxCount ? ' max' : ''}`)
    .attr('transform', d => `translate(${xScale(String(d.value)) ?? 0}, ${height - y(d.count)})`)
    .call(g => {
      g.append('rect')
        .attr('width', xScale.bandwidth())
        .attr('height', d => Math.max(1, y(d.count)))

      g.append('line')
        .attr('x1', 0)
        .attr('x2', xScale.bandwidth())
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'black')
    })

  // Max value annotation
  const maxBucket = buckets.find(d => d.count === maxCount)
  if (maxBucket) {
    const xCenter = (xScale(String(maxBucket.value)) ?? 0) + xScale.bandwidth() / 2
    const yTop = height - y(maxBucket.count)

    const maxvalG = svg
      .append('g')
      .attr('class', 'maxval')
      .attr('transform', `translate(${xCenter}, ${yTop})`)
    maxvalG.append('circle').attr('class', 'point').attr('r', 2)
    const xPos = Math.min(xCenter, width - 120) // prevent overflowing on the right
    maxValueLabel.value?.setAttribute('style', `left: ${xPos}px; top: ${yTop - 20}px;`)
  }
  // Hover overlay (single reusable group)
  const hoverG = svg.append('g').attr('class', 'hovered-bar').style('pointer-events', 'none')

  const hoveredBackground = hoverG
    .append('rect')
    .attr('class', 'hovered-background')
    .attr('y', 0)
    .attr('height', 0)
  const hoveredValue = hoverG
    .append('rect')
    .attr('class', 'hovered-value')
    .attr('y', 0)
    .attr('height', 0)

  function showHover(bucket: Bucket): void {
    const bx = xScale(String(bucket.value)) ?? 0
    const bw = xScale.bandwidth()
    const bh = height - y(bucket.count)

    hoverG.attr('transform', `translate(${bx}, 0)`)
    hoveredBackground.attr('width', bw).attr('height', height)
    hoveredValue.attr('width', bw).attr('y', 0).attr('height', bh)
  }

  function hideHover(): void {
    hoveredBackground.attr('height', 0)
    hoveredValue.attr('height', 0)
  }

  // Hit areas — full step width (bar + padding), invisible, cover the entire column height.
  // This eliminates the gap between bars that was firing spurious mouseleave events.
  const stepWidth = xScale.step() // bandwidth + padding
  svg
    .append('g')
    .attr('class', 'hit-areas')
    .selectAll<SVGRectElement, Bucket>('rect')
    .data(buckets)
    .join('rect')
    .attr('x', d => (xScale(String(d.value)) ?? 0) - (stepWidth - xScale.bandwidth()) / 2)
    .attr('y', 0)
    .attr('width', stepWidth)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('mouseenter.histogram', (_, bucket) => {
      showHover(bucket)
      emit('mousemove', {
        pointer: {
          x: (xScale(String(bucket.value)) ?? 0) + xScale.bandwidth() / 2,
          y: height - y(bucket.count)
        },
        bucket
      })
      if (props.showTooltip) {
        tooltipState.value = {
          x: (xScale(String(bucket.value)) ?? 0) + xScale.bandwidth() / 2,
          y: height - y(bucket.count),
          isActive: true,
          bucket
        }
      }
    })
    .on('mouseleave.histogram', (event, bucket) => {
      // Only hide if we're not entering a sibling hit-area rect (i.e. moving to the next bar)
      const related = event.relatedTarget as Element | null
      if (related?.closest('.hit-areas')) return
      hideHover()
      emit('mousemove', null)
      if (props.showTooltip) tooltipState.value = { ...tooltipState.value, isActive: false }
    })
    .on('click.histogram', (_, bucket) => {
      emit('click', { bucket })
    })

  // Remove the old svg-level mousemove/mouseleave/click handlers
  svg.on('mousemove.histogram', null).on('mouseleave.histogram', null).on('click.histogram', null)
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', renderChart)
  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderChart)
})

watch(
  () => props.buckets,
  () => {
    if (chart.value) renderChart()
  }
)
</script>

<style lang="css">
.HistogramSlider {
  position: relative;
}
.HistogramSlider .slider {
  width: 100% !important;
  margin-bottom: 1.4em;
}

.HistogramSlider .chart .bars .bar rect {
  fill: #d8d8d8;
}
.HistogramSlider .chart .bars .bar.max rect {
  fill: #999999;
}

.HistogramSlider .hovered-value {
  fill: #999999;
}

.HistogramSlider .hovered-background {
  fill: var(--impresso-color-black);
}

.HistogramSlider .maxval {
  font-size: 12px;
}
.HistogramSlider .maxval .point {
  fill: var(--impresso-color-black);
}
.HistogramSlider__maxValueLabel {
  transform: translateX(-10px);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<i18n lang="json">
{
  "en": {
    "maxval": "max: <span class='number'>{n}</span> results ({val})",
    "maxvalrange": "max: <span class='number'>{n}</span> results ({lower} - {upper})",
    "valRange": "{lower} - {upper} ({n} results)",
    "val": "{val} ({n} results)",
    "valueLabel": "{n}",
    "valueAsPercentageLabel": "{val}%",
    "tooltipContent": "{val}: {count} results"
  }
}
</i18n>
