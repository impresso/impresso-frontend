<template>
  <div class="SourcesOverviewTimeline position-relative">
    <slot name="tooltip"></slot>
    <div
      class="timeline-container"
      @mousemove="containerOnMousemove"
      ref="containerRef"
      style="max-height: 500px; overflow: auto"
    >
      <div style="position: sticky; top: 0">
        <svg
          :width="svgWidth"
          :height="svgHeight"
          style="background-color: rgba(220, 220, 220, 0.8); backdrop-filter: blur(10px)"
        >
          <line
            :x1="margin.left"
            :y1="svgHeight - margin.bottom"
            :x2="svgWidth - margin.right"
            :y2="svgHeight - margin.bottom"
            stroke="#333"
            stroke-width="1"
          />

          <!-- Year ticks and labels -->
          <g v-for="year in years" :key="year">
            <!-- Tick mark -->
            <line
              :x1="xScale(new Date(year, 0, 1))"
              :y1="svgHeight - margin.bottom"
              :x2="xScale(new Date(year, 0, 1))"
              :y2="svgHeight - margin.bottom - tickHeight"
              stroke="#333"
              :stroke-width="year % 10 === 0 ? 3 : year % 5 === 0 ? 2 : 1"
            />

            <!-- Year label (only for decades and every 5 years) -->
            <text
              v-if="shouldShowLabel(year)"
              :x="xScale(new Date(year, 0, 1))"
              :y="svgHeight - margin.bottom - tickHeight - 8"
              text-anchor="middle"
              :font-weight="year % 10 === 0 ? 'bold' : 'normal'"
              fill="#333"
              class="small"
            >
              {{ year }}
            </text>
          </g>

          <!-- Start and end date markers -->
          <g>
            <!-- Start date marker -->
            <circle :cx="xScale(startDate)" :cy="svgHeight - margin.bottom" r="4" fill="#007bff" />

            <!-- End date marker -->
            <circle :cx="xScale(endDate)" :cy="svgHeight - margin.bottom" r="4" fill="#dc3545" />
          </g>
        </svg>
      </div>
      <svg :width="svgWidth" :height="gridHeight">
        <g v-for="year in years" :key="year">
          <line
            :x1="xScale(new Date(year, 0, 1))"
            :y1="0"
            :x2="xScale(new Date(year, 0, 1))"
            :y2="gridHeight - margin.bottom"
            stroke="#333"
            :stroke-width="
              year % 10 === 0
                ? decadeStrokeWidth
                : year % 5 === 0
                  ? fiveYearStrokeWidth
                  : singleYearStrokeWidth
            "
          />
        </g>
        <g>
          <!-- Data values visualization -->
          <g v-for="(dataValue, index) in dataValues" :key="index">
            <!-- Date range visualization -->
            <g v-if="dataValue.dateRange">
              <!-- Range rectangle -->
              <rect
                :x="xScale(dataValue.dateRange[0])"
                :y="yScale(index) - 8"
                :width="xScale(dataValue.dateRange[1]) - xScale(dataValue.dateRange[0])"
                :height="16"
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                stroke-width="1"
                rx="3"
              />
              <!-- Start date marker -->
              <circle
                :cx="xScale(dataValue.dateRange[0])"
                :cy="yScale(index)"
                r="3"
                fill="#007bff"
              />
              <!-- End date marker -->
              <circle
                :cx="xScale(dataValue.dateRange[1])"
                :cy="yScale(index)"
                r="3"
                fill="#007bff"
              />
            </g>

            <!-- Single date visualization -->
            <g v-else>
              <circle
                :cx="xScale(dataValue.date)"
                :cy="yScale(index)"
                r="4"
                fill="#28a745"
                stroke="#fff"
                stroke-width="1"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const singleYearStrokeWidth = 0.25
const decadeStrokeWidth = 1
const fiveYearStrokeWidth = 0.5

export interface DataValue {
  date: Date
  dateRange?: [Date, Date]
  value: number
}

export interface Props {
  startDate: Date
  endDate: Date
  dataValues?: DataValue[]
  minimumGap?: number
}

const props = withDefaults(defineProps<Props>(), {
  dataValues: () => [],
  minimumGap: 5
})

const emit = defineEmits<{
  (
    e: 'tooltipMove',
    payload: { value?: DataValue; otherValuesOnDate: DataValue[]; date: Date; x: number; y: number }
  ): void
  (e: 'tooltipOut'): void
}>()

const containerRef = ref<HTMLElement>()
const containerClientX = ref(0)
const containerClientY = ref(0)
const containerScrollTop = ref(0)
const containerScrollLeft = ref(0)
const containerWidth = ref(800)
const svgHeight = 120
const gridHeight = 1000
const margin = {
  top: 20,
  right: 40,
  bottom: 40,
  left: 40
}

const tickHeight = 15

const years = computed(() => {
  const yearsArray = []
  for (let year = props.startDate.getFullYear(); year <= props.endDate.getFullYear(); year++) {
    yearsArray.push(year)
  }
  return yearsArray
})

const svgWidth = computed(() => {
  return years.value.length * props.minimumGap! + margin.left + margin.right
})
// D3 scale for positioning
const xScale = computed(() => {
  return d3
    .scaleTime()
    .domain([props.startDate, props.endDate])
    .range([margin.left, svgWidth.value - margin.right])
    .clamp(true)
})

// Y scale for positioning data values based on their index

interface ScalePointWithInvert extends d3.ScalePoint<number> {
  invertIndex: (y: number) => number
}
const yScale = computed<ScalePointWithInvert>(() => {
  const scale = d3
    .scalePoint<number>()
    .domain(d3.range(props.dataValues.length))
    .range([margin.top, margin.top + (props.dataValues.length - 1) * props.minimumGap])

  ;(scale as ScalePointWithInvert).invertIndex = (y: number) => {
    const step = scale.step()
    const idx = Math.round((y - margin.top) / step)
    return Math.max(0, Math.min(props.dataValues.length - 1, idx))
  }

  return scale as ScalePointWithInvert
})

// Determine which years should show labels
const shouldShowLabel = (year: number): boolean => {
  // Always show decades (bold)
  if (year % 10 === 0 || year % 5 === 0) return true

  return false
}

// Handle container resize
const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
}

/**
 * Emit tooltip event with current date and position
 * calculate the current item based on mouse position and d3 scales.
 * Called by mousemove event listener and scrollEvent listener
 */
const emitTooltipEvent = () => {
  // get current scrollLeft too to calculate actual position on the graphics
  const visX = containerClientX.value + containerScrollLeft.value
  const visY = containerClientY.value + containerScrollTop.value
  // get current date from visX position, limit to data range
  if (visX < margin.left || visX > svgWidth.value - margin.right) {
    emit('tooltipOut')
    return
  }
  const date = xScale.value.invert(visX)
  const { dataValue, otherValuesOnDate } = getDataValuesAtPosition(visX, visY)
  console.log('Emitting tooltipMove', { date, visX, visY, dataValue, otherValuesOnDate })
  emit('tooltipMove', { date, x: visX, y: visY, value: dataValue, otherValuesOnDate })
}
/**
 * Finds the closest data value to the given position coordinates.
 * First finds the closest date match based on x coordinate,
 * then if multiple values exist on the same date, selects the one
 * closest to the y coordinate position.
 *
 * @param x - The x coordinate position
 * @param y - The y coordinate position
 * @returns The closest data value and other values on the same date
 */
const getDataValuesAtPosition = (
  x: number,
  y: number
): {
  dataValue: DataValue | undefined
  otherValuesOnDate: DataValue[]
} => {
  // Find the closest data value to the given date
  const date = xScale.value.invert(x)
  let closestValue: DataValue | undefined = undefined
  let otherValuesOnDate: DataValue[] = []
  let minDiff = Infinity
  // Check if we should consider date ranges
  for (const value of props.dataValues) {
    let diff: number

    if (value.dateRange) {
      // For date ranges, calculate distance to the range
      const [rangeStart, rangeEnd] = value.dateRange
      if (date >= rangeStart && date <= rangeEnd) {
        // Date is within range, perfect match
        diff = 0
      } else {
        // Calculate distance to closest edge of range
        const diffToStart = Math.abs(date.getTime() - rangeStart.getTime())
        const diffToEnd = Math.abs(date.getTime() - rangeEnd.getTime())
        diff = Math.min(diffToStart, diffToEnd)
      }
    } else {
      // Single date value
      diff = Math.abs(value.date.getTime() - date.getTime())
    }

    if (diff < minDiff) {
      minDiff = diff
      closestValue = value
      otherValuesOnDate = [value]
    } else if (diff === minDiff) {
      otherValuesOnDate.push(value)
    }
  }

  for (const value of props.dataValues) {
    const diff = Math.abs(value.date.getTime() - date.getTime())
    if (diff < minDiff) {
      minDiff = diff
      closestValue = value
      otherValuesOnDate = [value]
    } else if (diff === minDiff) {
      otherValuesOnDate.push(value)
    }
  }

  // If multiple values exist on the same date, find the closest by Y position
  if (otherValuesOnDate.length > 1) {
    const closestIndex = yScale.value.invertIndex(y)
    closestValue = otherValuesOnDate[closestIndex] || otherValuesOnDate[0]
  }

  return { dataValue: closestValue, otherValuesOnDate }
}

const containerOnScrollHandler = (event: Event) => {
  const target = event.target as HTMLElement
  containerScrollTop.value = target.scrollTop
  containerScrollLeft.value = target.scrollLeft
  emitTooltipEvent()
}

/* Mouse events */
const containerOnMousemove = ({ clientX, clientY }: MouseEvent) => {
  const x = clientX - containerRef.value!.getBoundingClientRect().left
  const y = clientY - containerRef.value!.getBoundingClientRect().top
  containerClientX.value = x
  containerClientY.value = y
  emitTooltipEvent()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateContainerWidth()

  // Set up resize observer for responsive behavior
  if (containerRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(updateContainerWidth)
    resizeObserver.observe(containerRef.value)
  } else {
    // Fallback for older browsers
    window.addEventListener('resize', updateContainerWidth)
  }

  // Add scroll event listener
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', containerOnScrollHandler)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', updateContainerWidth)
  }
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', containerOnScrollHandler)
  }
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  min-height: 120px;
}

svg {
  display: block;
}
</style>
