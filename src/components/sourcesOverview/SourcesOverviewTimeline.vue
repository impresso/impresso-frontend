<style lang="css">
.SourcesOverviewTimeline {
  --z-index-pointer: 10;
  --z-index-x-axis: 5;
  --z-index-data-values: 1;
}
.SourcesOverviewTimeline__pointer {
  z-index: var(--z-index-pointer);
  position: absolute;
  top: 10px;
  left: 0;
  bottom: 0;
  width: 2px;
  background: purple;
  pointer-events: none;
  transition:
    opacity 0.3s ease-out,
    transform 0.1s ease-out;
  opacity: 0;
  transform: translate3d(0, 0, 0);
}
.SourcesOverviewTimeline__xAxis {
  position: sticky;
  top: 0;
  z-index: var(--z-index-x-axis);
}
.SourcesOverviewTimeline__xAxis svg {
  background-color: rgba(220, 220, 220, 0.1);
  backdrop-filter: blur(5px);
}

.SourcesOverviewTimeline__grid svg line {
  stroke: var(--impresso-color-black-alpha-20);
}
</style>
<template>
  <div class="SourcesOverviewTimeline position-relative">
    <slot name="tooltip"></slot>
    <div
      class="SourcesOverviewTimeline__pointer"
      :style="{
        opacity: currentDateRef.show ? 1 : 0,
        transform: 'translate3d(' + currentDateRef.x + 'px, 0, 0)'
      }"
    >
      <div
        :style="{
          position: 'absolute',
          top: '0',
          left: '-50px',
          width: '100px',
          textAlign: 'center',
          color: 'white'
        }"
      >
        <span style="background: purple" class="py-1 px-2 rounded">{{ currentDateRef.year }} </span>
      </div>
    </div>
    <div
      class="timeline-container position-relative"
      @mousemove="containerOnMousemove"
      @mouseout="containerOnMouseout"
      ref="containerRef"
      style="height: 100%; overflow: auto"
    >
      <div class="SourcesOverviewTimeline__xAxis">
        <svg :width="svgWidth" :height="svgHeight">
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
              class="very-small"
            >
              {{ year }}
            </text>
          </g>
        </svg>
      </div>
      <div
        class="SourcesOverviewTimeline__grid position-absolute"
        :style="{ top: svgHeight + 'px' }"
      >
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
        </svg>
      </div>
      <div
        class="position-absolute left-0"
        :style="{
          top: svgHeight + 'px',
          zIndex: 'var(--z-index-data-values)'
        }"
      >
        <div
          v-for="dataValue in dataValues"
          :key="dataValue.id"
          class="my-2 position-absolute"
          :style="{
            transform:
              'translate(' +
              xScale(dataValue.dateRange[0]) +
              'px, ' +
              (yScale(dataValues.indexOf(dataValue)) - props.minimumVerticalGap / 2) +
              'px)'
          }"
        >
          <SourcesOverviewDateValueItem
            :dataValue="dataValue"
            :width="xScale(dataValue.dateRange[1]) - xScale(dataValue.dateRange[0])"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { b } from 'vitest/dist/chunks/suite.d.FvehnV49.js'
import SourcesOverviewDateValueItem, { DataValue } from './SourcesOverviewDateValueItem.vue'

const singleYearStrokeWidth = 0.25
const decadeStrokeWidth = 1
const fiveYearStrokeWidth = 0.5

export interface Props {
  startDate: Date
  endDate: Date
  dataValues?: DataValue[]
  minimumGap?: number
  minimumVerticalGap?: number
}

const props = withDefaults(defineProps<Props>(), {
  dataValues: () => [],
  minimumGap: 8,
  minimumVerticalGap: 50
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

const svgHeight = computed(() => {
  return margin.top + margin.bottom + tickHeight + 20
})
const gridHeight = computed(() => {
  return Math.max(
    props.dataValues.length * props.minimumVerticalGap + margin.bottom + margin.top,
    1000
  )
})
const margin = {
  top: 20,
  right: 40,
  bottom: 10,
  left: 40
}
// Mouse position tracking for the follow line
const currentDateRef = ref<{
  x: number
  y: number
  show: boolean
  year: number
}>({
  x: 0,
  y: 0,
  show: false,
  year: 0
})
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
    .range([margin.top, margin.top + (props.dataValues.length - 1) * props.minimumVerticalGap])

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
  const isInContainer = visX < margin.left || visX > svgWidth.value - margin.right
  const date = xScale.value.invert(visX)
  const year = date.getFullYear()
  // set the x of the follow line to the year start position
  const yearStartX = xScale.value(new Date(year, 0, 1)) - containerScrollLeft.value

  // Update mouse position for the follow line
  currentDateRef.value = {
    x: yearStartX,
    y: containerClientY.value,
    show: !isInContainer,
    year: date.getFullYear()
  }
  // get current date from visX position, limit to data range
  if (isInContainer) {
    emit('tooltipOut')

    return
  }

  const { dataValue, otherValuesOnDate } = getDataValuesAtPosition(visX, visY)
  if (dataValue) {
    console.log('dataValue', { date, visX, visY, dataValue, otherValuesOnDate })
  }
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
  const dataValuesIndex = yScale.value.invertIndex(y)
  let dataValue: DataValue | undefined = undefined
  let otherValuesOnDate: DataValue[] = []
  for (let i = 0; i < props.dataValues.length; i++) {
    const value = props.dataValues[i]

    if (dataValuesIndex === i) {
      if (value.dateRange) {
        if (date >= value.dateRange[0] && date <= value.dateRange[1]) {
          dataValue = value
        }
      } else if (value.date.getTime() === date.getTime()) {
        dataValue = value
      }
    } else if (value.dateRange && date >= value.dateRange[0] && date <= value.dateRange[1]) {
      otherValuesOnDate.push(value)
    }
  }

  return { dataValue, otherValuesOnDate }
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

const containerOnMouseout = () => {
  currentDateRef.value.show = false
  emit('tooltipOut')
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
