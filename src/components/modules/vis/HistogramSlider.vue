<template>
  <b-container class="histogram-slider">
    <b-col>
      <b-row ref="chartContainer" class="position-relative">
        <svg ref="chart" class="chart" preserveAspectRatio="none"></svg>
        <Tooltip v-if="showTooltip" :tooltip="tooltipState">
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
          :tooltip-formatter="formatTooltip"
          :tooltip-placement="onlyRangeLabels ? 'bottom' : 'top'"
          data-testid="slider-control"
        />
      </b-row>
    </b-col>
  </b-container>
</template>

<script setup lang="ts">
/**
 * NOTE: Only works with integers. If you need to do fractions you
 * will need to normalise them.
 */
import Bucket from '@/models/Bucket'
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
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

// i18n is used here in renderChart() for D3-managed SVG text — cannot use template bindings
const { t, n } = useI18n()

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

// Computed
const sliderRange = computed(() => {
  const vals = (props.buckets ?? []).map(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value
  )
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  console.info('sliderRange()', { min, max, vals, range: props.range })
  if (props.range == null) return [min, max]
  return [min < props.range[0] ? min : props.range[0], max > props.range[1] ? max : props.range[1]]
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
  return !isNaN(min) && isFinite(min) && !isNaN(max) && isFinite(max) && !isNaN(v0) && !isNaN(v1)
})

// Helpers
function getChartContainerElement(): HTMLElement | null {
  const el = chartContainer.value
  if (!el) return null
  return el instanceof HTMLElement ? el : (el as ComponentPublicInstance & { $el: HTMLElement }).$el
}

function getChartElement(): SVGSVGElement | null {
  return chart.value ?? null
}

function formatTooltip(d: number): string {
  return n(d)
}

function renderChart(): void {
  if (!props.buckets?.length) return

  const chartContainerEl = getChartContainerElement()
  const chartEl = getChartElement()
  if (!chartContainerEl || !chartEl) return

  const topMargin = 14
  const { width } = chartContainerEl.getBoundingClientRect()
  const svg = d3.select(chartEl)

  svg.attr('width', width)
  svg.attr('height', props.chartHeight)

  const counts = props.buckets.map(({ count }) => count)
  const maxCountBucketIndex = counts.indexOf(Math.max(...counts))

  const x = d3
    .scaleBand()
    .domain(props.buckets.map(({ value }) => String(value)))
    .range([0, width])
    .paddingInner(0.05)

  const yScaler = {
    linear: d3.scaleLinear(),
    sqrt: d3.scaleSqrt(),
    symlog: d3.scaleSymlog()
  }[props.scaleType ?? 'linear']

  const y = yScaler
    .domain([Math.min(...counts), Math.max(...counts)])
    .range([0, props.chartHeight - topMargin])

  const barIndexWithMaximumValue = props.buckets.reduce((acc, d, i) => {
    if (acc === -1) return i
    if (d.count > props.buckets![acc].count) return i
    return acc
  }, -1)

  const bars = svg
    .selectAll('g.bars')
    .data([null])
    .join('g')
    .attr('class', 'bars')
    .selectAll('g.bar')
    .data(props.buckets)
    .join('g')
    .attr('class', (d, i) => (i === barIndexWithMaximumValue ? 'bar max' : 'bar'))
    .attr(
      'transform',
      d => `translate(${x(String(d.value)) ?? 0}, ${props.chartHeight - y(d.count)})`
    )

  // add rects to the bars
  bars
    .append('rect')
    .attr('width', x.bandwidth())
    .attr('height', d => Math.max(1, y(d.count)))

  // add a black line on top of the bars
  bars
    .append('line')
    .attr('x1', 0)
    .attr('x2', x.bandwidth())
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', 'black')

  bars
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(String(d.value)) ?? 0)
    .attr('width', x.bandwidth())
    .attr('y', d => props.chartHeight - y(d.count))
    .attr('height', d => Math.max(1, y(d.count)))
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', x.bandwidth())
    .attr('y2', 0)
    .attr('stroke', 'black')

  const hoveredBar = svg.selectAll('g.hovered-bar').data([null]).join('g')

  const hoveredBackground = hoveredBar
    .append('rect')
    .attr('class', 'hovered-background')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', x.bandwidth())
    .attr('height', 0)

  const hoveredValue = hoveredBar
    .append('rect')
    .attr('class', 'hovered-value')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', x.bandwidth())
    .attr('height', 0)

  svg
    .on('mousemove', event => {
      const [xPos] = d3.pointer(event)
      const bucket = props.buckets!.find(
        ({ value }) =>
          (x(String(value)) ?? 0) <= xPos && xPos <= (x(String(value)) ?? 0) + x.bandwidth()
      )
      if (bucket) {
        const xBucket = x(String(bucket.value)) ?? 0
        const yBucket = props.chartHeight - y(bucket.count)
        emit('mousemove', {
          pointer: { x: xBucket + x.bandwidth() / 2, y: yBucket },
          bucket
        })
        hoveredBar.attr('transform', `translate(${xBucket}, ${yBucket})`)
        hoveredValue.attr('height', Math.max(2, props.chartHeight - yBucket - 1))
        hoveredBackground.attr('height', props.chartHeight - topMargin)

        if (props.showTooltip) {
          tooltipState.value = {
            x: xBucket + x.bandwidth() / 2,
            y: props.chartHeight - y(bucket.count) - 50,
            isActive: true,
            bucket
          }
        }
      } else {
        emit('mousemove', null)
        if (props.showTooltip) {
          tooltipState.value.isActive = false
        }
      }
    })
    .on('mouseleave', () => {
      emit('mousemove', null)
      hoveredValue.attr('height', 0)
      hoveredBackground.attr('height', 0)
    })
    .on('click', event => {
      const [xPos] = d3.pointer(event)
      const bucket = props.buckets!.find(
        ({ value }) =>
          (x(String(value)) ?? 0) <= xPos && xPos <= (x(String(value)) ?? 0) + x.bandwidth()
      )
      if (bucket) {
        emit('click', { bucket })
      }
    })

  const maxval = svg
    .selectAll('g.maxval')
    .data(maxCountBucketIndex >= 0 ? [props.buckets[maxCountBucketIndex]] : [])
    .join('g')
    .attr('class', 'maxval')
    .attr('transform', bucket => {
      const xOffset = (x(String(bucket.value)) ?? 0) + x.bandwidth() / 2
      const yOffset = props.chartHeight - y(bucket.count)
      return `translate(${xOffset}, ${yOffset})`
    })

  maxval
    .selectAll('text')
    .data(d => [d])
    .join('text')
    .attr('dy', -5)
    .text(bucket => {
      const tlabel =
        !isNaN(bucket.upper) && bucket.upper !== bucket.lower ? 'maxvalrange' : 'maxval'
      return t(tlabel, {
        n: n(Math.round(bucket.count)),
        ...bucket,
        value: t(props.valueLabel, {
          value: bucket.value,
          valueAsNumber: n(parseFloat('' + bucket.value))
        })
      })
    })
    .attr('text-anchor', bucket => {
      const xOffset = (x(String(bucket.value)) ?? 0) + x.bandwidth() / 2
      const oneThirdWidth = width / 3
      if (xOffset <= oneThirdWidth) return 'start'
      if (xOffset >= 2 * oneThirdWidth) return 'end'
      return 'middle'
    })

  maxval
    .selectAll('circle.point')
    .data(d => [d])
    .join('circle')
    .attr('class', 'point')
    .attr('r', 2)
}

function onWindowResize(): void {
  renderChart()
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', onWindowResize)
  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
})

// Watchers
watch(
  () => props.buckets,
  () => {
    if (getChartElement()) renderChart()
  }
)
</script>

<style lang="scss">
.histogram-slider {
  .slider {
    width: 100% !important;
    margin-bottom: 1.4em; // slider ticks
  }

  .chart {
    .bars {
      .bar {
        fill: #d8d8d8;
      }

      .bar.max {
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

    /* Tooltip styles are now handled by the Tooltip component */
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
