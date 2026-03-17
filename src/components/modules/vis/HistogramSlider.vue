<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer" class="position-relative">
        <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
        <Tooltip v-if="showTooltip && tooltipState.isActive" :tooltip="tooltipState">
          <template v-if="tooltipState.bucket">
            {{
              $t('tooltipContent', {
                val: tooltipState.bucket.value,
                count: $n(tooltipState.bucket.count)
              })
            }}
          </template>
        </Tooltip>
      </b-row>
      <b-row v-if="shouldEnableSlider">
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
      </b-row>
    </b-col>
  </b-container>
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
}

const props = withDefaults(defineProps<HistogramSliderProps>(), {
  chartHeight: 50,
  onlyRangeLabels: false,
  scaleType: 'linear',
  valueLabel: 'valueLabel',
  showTooltip: false
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

function bucketAtX(x: d3.ScaleBand<string>, xPos: number): Bucket | undefined {
  return props.buckets?.find(({ value }) => {
    const left = x(String(value)) ?? 0
    return xPos >= left && xPos < left + x.bandwidth()
  })
}

// Computed
const sliderRange = computed(() => {
  const vals = (props.buckets ?? []).map(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value
  )
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  if (props.range == null) return [min, max]
  return [Math.min(min, props.range[0]), Math.max(max, props.range[1])]
})

const sliderValue = computed({
  get() {
    return props.modelValue?.length === 2
      ? props.modelValue
      : [sliderRange.value[0], sliderRange.value[1]]
  },
  set(value?: number[]) {
    emit('change', value)
    emit('update:modelValue', value)
  }
})

const shouldEnableSlider = computed(() => {
  const [min, max] = sliderRange.value
  const [v0, v1] = sliderValue.value
  return [min, max, v0, v1].every(n => !isNaN(n) && isFinite(n))
})

// Chart rendering
function renderChart(): void {
  const buckets = props.buckets
  if (!buckets?.length) return

  const containerEl = getChartContainerEl()
  const chartEl = chart.value
  if (!containerEl || !chartEl) return

  const TOP_MARGIN = 14
  const { width } = containerEl.getBoundingClientRect()
  const height = props.chartHeight

  const svg = d3.select(chartEl).attr('width', width).attr('height', height)

  // Clear previous render
  svg.selectAll('*').remove()

  // Scales
  const x = d3
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
    .range([0, height - TOP_MARGIN])

  const maxCount = Math.max(...counts)

  // Bars group
  const barsGroup = svg.append('g').attr('class', 'bars')

  barsGroup
    .selectAll<SVGGElement, Bucket>('g.bar')
    .data(buckets)
    .join('g')
    .attr('class', d => `bar${d.count === maxCount ? ' max' : ''}`)
    .attr('transform', d => `translate(${x(String(d.value)) ?? 0}, ${height - y(d.count)})`)
    .call(g => {
      g.append('rect')
        .attr('width', x.bandwidth())
        .attr('height', d => Math.max(1, y(d.count)))

      g.append('line')
        .attr('x1', 0)
        .attr('x2', x.bandwidth())
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'black')
    })

  // Max value annotation
  const maxBucket = buckets.find(d => d.count === maxCount)
  if (maxBucket) {
    const xCenter = (x(String(maxBucket.value)) ?? 0) + x.bandwidth() / 2
    const yTop = height - y(maxBucket.count)
    const label =
      !isNaN(maxBucket.upper) && maxBucket.upper !== maxBucket.lower ? 'maxvalrange' : 'maxval'

    const anchor = xCenter <= width / 3 ? 'start' : xCenter >= (2 * width) / 3 ? 'end' : 'middle'

    const maxvalG = svg
      .append('g')
      .attr('class', 'maxval')
      .attr('transform', `translate(${xCenter}, ${yTop})`)
    maxvalG.append('text').attr('dy', -5).attr('text-anchor', anchor).text(label)
    maxvalG.append('circle').attr('class', 'point').attr('r', 2)
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
    const bx = x(String(bucket.value)) ?? 0
    const bw = x.bandwidth()
    const by = height - y(bucket.count)

    hoverG.attr('transform', `translate(${bx}, 0)`)
    hoveredBackground.attr('width', bw).attr('height', height - TOP_MARGIN)
    hoveredValue
      .attr('width', bw)
      .attr('y', by)
      .attr('height', Math.max(2, height - by - 1))
  }

  function hideHover(): void {
    hoveredBackground.attr('height', 0)
    hoveredValue.attr('height', 0)
  }

  // Hit areas — full step width (bar + padding), invisible, cover the entire column height.
  // This eliminates the gap between bars that was firing spurious mouseleave events.
  const stepWidth = x.step() // bandwidth + padding
  svg
    .append('g')
    .attr('class', 'hit-areas')
    .selectAll<SVGRectElement, Bucket>('rect')
    .data(buckets)
    .join('rect')
    .attr('x', d => (x(String(d.value)) ?? 0) - (stepWidth - x.bandwidth()) / 2)
    .attr('y', 0)
    .attr('width', stepWidth)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('mouseenter.histogram', (_, bucket) => {
      showHover(bucket)
      emit('mousemove', {
        pointer: {
          x: (x(String(bucket.value)) ?? 0) + x.bandwidth() / 2,
          y: height - y(bucket.count)
        },
        bucket
      })
      if (props.showTooltip) {
        tooltipState.value = {
          x: (x(String(bucket.value)) ?? 0) + x.bandwidth() / 2,
          y: height - y(bucket.count) - 50,
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

<style lang="scss">
.histogram-slider {
  .slider {
    width: 100% !important;
    margin-bottom: 1.4em;
  }

  .chart {
    .bars {
      .bar rect {
        fill: #d8d8d8;
      }
      .bar.max rect {
        fill: #999999;
      }
    }

    .hovered-value {
      fill: #999999;
    }

    .hovered-background {
      fill: #b65656;
    }

    .maxval {
      font-size: 12px;

      .point {
        fill: var(--impresso-color-black);
      }
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "maxval": "{val} ({n} results)",
    "maxvalrange": "{lower} - {upper} ({n} results)",
    "valueLabel": "{n}",
    "valueAsPercentageLabel": "{val}%",
    "tooltipContent": "{val}: {count} results"
  }
}
</i18n>
