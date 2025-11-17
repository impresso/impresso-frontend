<template>
  <div class="SourcesOverviewTimeline position-relative">
    <slot name="tooltip">
      <Tooltip :tooltip="tooltip">
        <div v-if="tooltip.dataValue">
          <h4 class="text-white font-weight-bold font-size-inherit mb-0">
            {{ tooltip.dataValue.label }}
          </h4>
          <div className="small-caps mb-1">press</div>
          <div v-if="tooltip.currentDate">
            <div class="mb-2">
              {{ $d(tooltip.currentDate, 'year') }} &mdash;

              <span
                v-if="tooltip.exactDataValue?.value > 0"
                v-html="
                  $tc('numbers.contentItems', tooltip.exactDataValue?.value || 0, {
                    n: $n(tooltip.exactDataValue?.value || 0)
                  })
                "
              />
              <span v-else class="SourcesOverviewTimeline__empty">
                <span class="number">0</span> content items
              </span>
              &nbsp;
              <span
                v-if="tooltip.exactDataValue?.dateRange"
                v-html="
                  $t('dates.fromTo', {
                    from: $d(tooltip.exactDataValue.dateRange[0], 'short'),
                    to: $d(tooltip.exactDataValue.dateRange[1], 'short')
                  })
                "
              ></span>
            </div>
            <div class="small" v-if="tooltip.dataValue.dateRange">
              <span
                v-html="
                  $tc('numbers.contentItems', tooltip.dataValue?.value || 0, {
                    n: $n(tooltip.dataValue?.value || 0)
                  })
                "
              ></span
              >&nbsp;<span
                v-html="
                  $t('dates.fromTo', {
                    from: $d(tooltip.dataValue.dateRange[0], 'short'),
                    to: $d(tooltip.dataValue.dateRange[1], 'short')
                  })
                "
              ></span>
            </div>
          </div>
        </div>
      </Tooltip>
    </slot>
    <div
      class="SourcesOverviewTimeline__pointer"
      :style="{
        opacity: currentDateRef.show ? 1 : 0,
        transform: 'translate3d(' + currentDateRef.x + 'px, 0, 0)'
      }"
    >
      <div class="SourcesOverviewTimeline__pointer__label">
        <span class="py-1 px-2 rounded">{{ currentDateRef.year }} </span>
      </div>
    </div>
    <div
      class="timeline-container position-relative"
      @mousemove="containerOnMousemove"
      @mouseout="containerOnMouseout"
      ref="containerRef"
      :style="{ height: '100%', overflow: 'auto' }"
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
          <rect
            :transform="`translate(0 ${yScale.invertIndex(currentDateRef.y - svgHeight + containerScrollTop) * props.minimumVerticalGap})`"
            :x="0"
            :y="0"
            :width="svgWidth"
            :height="props.minimumVerticalGap"
            fill="rgba(128, 0, 128, 0.1)"
            :style="{
              transition: 'transform 0.1s ease-out',
              opacity: currentDateRef.show ? 1 : 0
            }"
            rx="4"
          />
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
          v-for="(dataValue, idx) in dataValues"
          :key="dataValue.id"
          class="position-absolute"
          :style="{
            transform:
              'translate(' +
              xScale(dataValue.dateRange[0]) +
              'px, ' +
              (yScale(idx) - margin.top) +
              'px)'
          }"
        >
          <SourcesOverviewDateValueItem
            :normalizeLocally="props.normalizeLocally"
            :dataValue="dataValue"
            :min-value="dataValuesExtent.min"
            :max-value="dataValuesExtent.max"
            :xScale="xScale"
            :height="props.minimumVerticalGap"
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
import SourcesOverviewDateValueItem, { DataValue } from './SourcesOverviewDateValueItem.vue'
import Tooltip from '../modules/tooltips/Tooltip.vue'

const singleYearStrokeWidth = 0.25
const decadeStrokeWidth = 1
const fiveYearStrokeWidth = 0.5

export interface Props {
  startDate: Date
  endDate: Date
  dataValues?: DataValue[]
  minimumGap?: number
  minimumVerticalGap?: number
  normalizeLocally?: boolean
  maxTooltipHeight?: number
  timeResolution?: 'year' | 'month' | 'day'
  addExtraHorizontalSpace?: boolean
  fitToContainerWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dataValues: () => [],
  minimumGap: 8,
  minimumVerticalGap: 20,
  normalizeLocally: false,
  maxTooltipHeight: 200,
  timeResolution: 'year',
  addExtraHorizontalSpace: true,
  fitToContainerWidth: true
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
const containerHeight = ref(600)

const svgHeight = computed(() => {
  return margin.top + margin.bottom + tickHeight + 20
})

const gridHeight = computed(() => {
  return Math.max(
    props.dataValues.length * props.minimumVerticalGap + margin.bottom + margin.top,
    svgHeight.value
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
  if (props.fitToContainerWidth) {
    console.log('fitToContainerWidth', containerWidth.value)
    return containerWidth.value
  }
  // check if gap should increase based on width minum margindivided by years length
  const gap = (containerWidth.value - margin.left - margin.right) / years.value.length
  if (gap < props.minimumGap!) {
    return years.value.length * props.minimumGap! + margin.left + margin.right
  }

  return years.value.length * gap + margin.left + margin.right
})
// D3 scale for positioning
const xScale = computed(() => {
  const range = props.addExtraHorizontalSpace
    ? [margin.left * 3, svgWidth.value - margin.right * 3]
    : [margin.left, svgWidth.value - margin.right]

  return d3.scaleTime().domain([props.startDate, props.endDate]).range(range).clamp(true)
})

const tooltip = ref<{
  x: number
  y: number
  isActive: boolean
  dataValue?: DataValue
  exactDataValue?: DataValue
  currentDate?: Date
}>({
  x: 0,
  y: 0,
  isActive: false,
  dataValue: undefined,
  exactDataValue: undefined,
  currentDate: undefined
})

const dataValuesExtent = computed<{ min: number; max: number }>(() => {
  let min = Infinity
  let max = -Infinity
  props.dataValues!.forEach(dv => {
    if (Array.isArray(dv.dataValues) && dv.dataValues.length > 0) {
      dv.dataValues.forEach(nestedDv => {
        if (nestedDv.value < min) min = nestedDv.value
        if (nestedDv.value > max) max = nestedDv.value
      })
    } else {
      if (dv.value < min) min = dv.value
      if (dv.value > max) max = dv.value
    }
  })
  return { min, max }
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
  // get available width in pixel per year
  const yearWidth = (svgWidth.value - margin.left - margin.right) / years.value.length
  console.debug('yearWidth', yearWidth)
  if (yearWidth < 5) {
    return year % 20 === 0
  }
  if (yearWidth < 8) {
    // if less than 20px per year, show only decades
    return year % 10 === 0
  }

  if (year % 10 === 0 || year % 5 === 0) return true

  return false
}

// Handle container resize
const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    containerHeight.value = containerRef.value.clientHeight
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
  const isOutOfContainer = visX < margin.left || visX > svgWidth.value - margin.right
  const date = xScale.value.invert(visX)
  const year = date.getFullYear()
  // Update mouse position for the follow line
  currentDateRef.value = {
    x: containerClientX.value,
    y: containerClientY.value,
    show: !isOutOfContainer,
    year: date.getFullYear()
  }
  const tooltipY =
    containerClientY.value + margin.top > containerHeight.value - props.maxTooltipHeight
      ? containerHeight.value - props.maxTooltipHeight
      : containerClientY.value + margin.top
  // get current date from visX position, limit to data range
  if (isOutOfContainer) {
    emit('tooltipOut')
    tooltip.value = {
      x: containerClientX.value,
      y: tooltipY,
      isActive: false
    }
    return
  }

  const { dataValue, otherValuesOnDate } = getDataValuesAtPosition(visX, visY)
  if (dataValue) {
    console.log('dataValue', dataValue.label)
    tooltip.value = {
      x: containerClientX.value,
      y: tooltipY,
      isActive: true,
      dataValue,
      exactDataValue: otherValuesOnDate[0],
      currentDate: date
    }
  } else {
    tooltip.value = {
      x: containerClientX.value,
      y: tooltipY,
      isActive: false
    }
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
  const dataValuesIndex = yScale.value.invertIndex(y - svgHeight.value)
  let dataValue: DataValue | undefined = undefined
  let otherValuesOnDate: DataValue[] = []

  // check if the props.datavalues at index has a date range that includes the date
  const currentDataValue = props.dataValues[dataValuesIndex]
  if (currentDataValue.dateRange) {
    if (date >= currentDataValue.dateRange[0] && date <= currentDataValue.dateRange[1]) {
      dataValue = currentDataValue
    }
  }
  if (!dataValue) {
    return { dataValue: undefined, otherValuesOnDate: [] }
  }
  if (dataValue && !Array.isArray(dataValue.dataValues)) {
    return { dataValue, otherValuesOnDate: [] }
  }
  // check current overlap
  if (dataValue && Array.isArray(dataValue.dataValues)) {
    otherValuesOnDate = dataValue.dataValues.filter(value => {
      if (value.dateRange) {
        return date >= value.dateRange[0] && date <= value.dateRange[1]
      }
      return false
    })
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
  // currentDateRef.value.show = false
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
  background: var(--impresso-color-black-alpha-20);
  pointer-events: none;
  transition:
    opacity 0.3s ease-out,
    transform 0.1s ease-out;
  opacity: 0;
  transform: translate3d(0, 0, 0);
}
.SourcesOverviewTimeline__pointer__label {
  position: absolute;
  top: 0;
  left: -50px;
  width: 100px;
  text-align: center;
  color: white;
}
.SourcesOverviewTimeline__pointer__label span {
  background-color: var(--impresso-color-black);
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

.SourcesOverviewTimeline .tooltip-inner {
  background-color: var(--impresso-color-black-deeper);
}
.SourcesOverviewTimeline .tooltip-inner .number {
  color: var(--impresso-color-black);
  background-color: white;
  border-radius: 10px;
  padding: 2px 6px;
  min-width: 25px;
  text-align: center;
  display: inline-block;
}
.SourcesOverviewTimeline .tooltip-inner .small .number {
  color: white;
  background-color: transparent;
  display: inline;
  padding: 0;
}

.SourcesOverviewTimeline .tooltip-inner .SourcesOverviewTimeline__empty .number {
  background-color: var(--impresso-color-white-alpha-50);
}
</style>
