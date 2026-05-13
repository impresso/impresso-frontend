<template>
  <div
    class="d3-timeline"
    ref="timelineEl"
    :style="`height: ${heightVal}`"
    :data-testid="dataTestid"
  >
    <tooltip :tooltip="tooltip">
      <!-- "meta" tooltip -->
      <slot :tooltip="tooltip">
        <div v-if="tooltip.item">{{ tooltip.item }}</div>
      </slot>
    </tooltip>
  </div>
</template>

<script setup lang="ts">
/**
 * Usage with custom tooltip (local computed variable)
 * <Timeline :values="values"
 *   :brush="[startDaterange, endDaterange]"
 *   :domain="[startYear, endYear]"
 *   @brushed="afterBrush()">
 *   <template v-slot="tooltipScope">
 *     <div v-if="tooltipScope.tooltip.item">
 *       {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
 *       <b>{{ tooltipScope.tooltip.item.w }}</b> {{ localComputedVar }}
 *     </div>
 *   </template>
 * </Timeline>
 */

import ContrastTimeline from '@/d3-modules/ContrastTimeline'
import TimelineD3 from '@/d3-modules/Timeline'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import * as d3 from 'd3'
import Dimension from '@/d3-modules/Dimension'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

type TimelineResolution = 'year' | 'month' | 'day'
type TimelineDomainValue = string | number | Date
type TimelineBrushValue = string | number | Date
type TimelineBrushRange = TimelineBrushValue[]

export interface TimelineDatum {
  t?: Date | string | number
  w?: number
  w1?: number
  p?: number
}

export interface TimelineProps {
  values?: object[]
  brush?: TimelineBrushRange
  domain?: TimelineDomainValue[]
  exponent?: number
  highlight?: TimelineDatum | null
  contrast?: boolean
  percentage?: boolean
  percentageTranslationFn?: (v: number) => string
  numberTranslationFn?: (v: number) => string
  highlightEnabledState?: boolean
  brushable?: boolean
  height?: string
  resolution?: TimelineResolution
  dataTestid?: string
}

interface TimelinePointer {
  x: number
  y: number
}

export interface TimelineInteractionPayload {
  pointer: TimelinePointer
  datum: TimelineDatum
}

interface TimelineBrushedPayload {
  brush: {
    min: number
    max: number
  }
  minDate: Date
  maxDate: Date
  minValue: string
  maxValue: string
}

interface TimelineInstance {
  dimensions: Record<string, any>
  timeParse: (s: string) => Date | null
  on(event: string, handler: (data?: unknown) => void): TimelineInstance
  resize(): void
  update(payload: any): void
  draw(): void
  brushTo(payload: { min: TimelineBrushValue; max: TimelineBrushValue }): void
  highlight(datum: any): void
  updateTimeFormat(format: string): void
}

const getTimeFormatForResolution = (resolution?: TimelineResolution) =>
  resolution === 'day' ? '%d %b %Y' : resolution === 'month' ? '%B %Y' : '%Y'

const props = withDefaults(defineProps<TimelineProps>(), {
  exponent: 1,
  brushable: true,
  height: '85px',
  resolution: 'year',
  dataTestid: 'timeline',
  percentageTranslationFn: (v: number) =>
    Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 }).format(v),
  numberTranslationFn: (v: number) => Intl.NumberFormat('en').format(v)
})

const emit = defineEmits<{
  (e: 'highlight-off'): void
  (e: 'highlight', data: TimelineInteractionPayload): void
  (e: 'brushed', data: TimelineBrushedPayload): void
  (e: 'brushing', data: TimelineBrushedPayload): void
  (e: 'brush-end', data: unknown): void
  (e: 'clear-selection'): void
}>()

const timelineEl = ref<HTMLElement | null>(null)
const tooltip = ref<{
  x: number
  y: number
  isActive: boolean
  item?: TimelineDatum
}>({
  x: 0,
  y: 0,
  isActive: false
})
const timeline = ref<TimelineInstance | null>(null)
let timelineTimer: ReturnType<typeof setTimeout> | null = null

const heightVal = computed(() => {
  if (typeof props.height === 'string') return props.height
  return 'auto'
})

function moveTooltip(data: TimelineInteractionPayload): void {
  tooltip.value = {
    isActive: true,
    x: data.pointer.x + 50,
    y: data.pointer.y - 50,
    item: data.datum
  }
}

function onResize(): void {
  timeline.value?.resize()
}

function forceTimelineUpdate(): void {
  if (!timeline.value) {
    console.warn('Timeline not initialized.')
    return
  }
  if (!props.values) {
    console.warn('No values provided to the timeline.')
    return
  }
  timeline.value.dimensions.y.domain[0] = 0
  const yProperty = timeline.value.dimensions.y.property
  timeline.value.dimensions.y.domain[1] = d3.max(props.values, d =>
    Number((d as Record<string, unknown>)[yProperty] ?? 0)
  ) as number
  timeline.value.update({ data: props.values as TimelineDatum[] })
  timeline.value.draw()
}

onMounted(() => {
  const dimensions = {
    x: new Dimension<TimelineDatum>({
      name: 'x',
      property: 't',
      type: Dimension.TYPE_CONTINUOUS,
      scaleFn: d3.scaleTime
    }),
    y: new Dimension<TimelineDatum>({
      name: 'y',
      property: props.percentage ? 'p' : 'w',
      type: Dimension.TYPE_CONTINUOUS,
      scaleFn: d3.scalePow,
      autoCalculateDomain: false,
      exponent: 1,
      isScalePow: true
    })
  }
  const n = d3.format('.2~s')
  const contextPeakTextFn = (v: number) => {
    if (props.percentage) return props.percentageTranslationFn(v)
    return props.numberTranslationFn(v)
  }

  if (props.contrast) {
    timeline.value = new ContrastTimeline({
      element: timelineEl.value as HTMLElement,
      margin: { left: 10, right: 10, top: 15 },
      domain: props.domain,
      format: getTimeFormatForResolution(props.resolution),
      dimensions,
      contextPeakTextFn
    }) as unknown as TimelineInstance
  } else {
    timeline.value = new TimelineD3({
      element: timelineEl.value as HTMLElement,
      margin: { left: 10, right: 10, top: 15 },
      domain: props.domain,
      brushable: props.brushable,
      format: getTimeFormatForResolution(props.resolution),
      dimensions,
      contextPeakTextFn
    }) as unknown as TimelineInstance
  }

  setTimeout(() => {
    forceTimelineUpdate()
    timeline.value?.resize()
  }, 0)

  timeline.value.on('mouseleave', () => {
    tooltip.value.isActive = false
    emit('highlight-off')
  })

  timeline.value.on('mousemove', data => {
    const typedData = data as TimelineInteractionPayload
    moveTooltip(typedData)
    emit('highlight', typedData)
  })

  timeline.value.on('brushed', data => {
    const typedData = data as TimelineBrushedPayload
    if (timelineTimer) clearTimeout(timelineTimer)
    timelineTimer = setTimeout(() => {
      emit('brushed', typedData)
    }, 50)
    emit('brushing', typedData)
  })

  timeline.value.on('brush-end', data => {
    emit('brush-end', data)
  })

  timeline.value.on('highlighted', data => {
    moveTooltip(data as TimelineInteractionPayload)
  })

  timeline.value.on('clear-selection', () => {
    emit('clear-selection')
  })

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

watch(
  () => props.exponent,
  (val: number) => {
    if (timeline.value) {
      timeline.value.dimensions.y.exponent = val
      forceTimelineUpdate()
    }
  }
)

watch(
  () => props.percentage,
  () => {
    if (timeline.value) {
      timeline.value.dimensions.y.property = props.percentage ? 'p' : 'w'
      forceTimelineUpdate()
    }
  }
)

watch(
  () => props.highlight,
  (val: TimelineDatum | null | undefined) => {
    if (timeline.value && val) {
      timeline.value.highlight(val)
    }
  }
)

watch(
  () => props.highlightEnabledState,
  (val: boolean | undefined) => {
    tooltip.value.isActive = Boolean(val)
  }
)

watch(
  () => props.brush,
  (val: TimelineBrushRange | undefined) => {
    if (!timeline.value || !val || val.length < 2) return
    const [min, max] = val
    if (min == null || max == null) return
    timeline.value.brushTo({ min, max })
  }
)

watch(
  () => props.values,
  () => {
    if (!timeline.value) return
    forceTimelineUpdate()
    if (props.brush && props.brush.length >= 2) {
      const [min, max] = props.brush
      if (min == null || max == null) return
      timeline.value.brushTo({ min, max })
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.resolution,
  (resolution: TimelineResolution | undefined) => {
    if (!timeline.value) return
    timeline.value.updateTimeFormat(getTimeFormatForResolution(resolution))
    timeline.value.draw()
  }
)

function applyXDomain(domainProp: TimelineDomainValue[] | undefined): void {
  if (!timeline.value) return

  if (domainProp && domainProp.length >= 2) {
    timeline.value.dimensions.x.setDomain({
      domain: domainProp.map(d => (d instanceof Date ? d : timeline.value!.timeParse(String(d))))
    })
  } else if (props.values && props.values.length > 0) {
    const extent = d3.extent(
      props.values as TimelineDatum[],
      d => (d.t instanceof Date ? d.t : timeline.value!.timeParse(String(d.t))) as Date
    )
    if (extent[0] && extent[1]) {
      timeline.value.dimensions.x.setDomain({ domain: [extent[0], extent[1]] })
    }
  }
}

watch(
  () => props.domain,
  (val: TimelineDomainValue[] | undefined) => {
    if (!timeline.value) return
    applyXDomain(val)
    forceTimelineUpdate()
  }
)
</script>

<style lang="scss">
@use 'sass:color';
@use '@/assets/legacy/bootstrap-impresso-theme-variables.scss' as *;

.d3-timeline {
  width: 100%;
  // height: 85px;
  position: relative;

  g.context path.curve {
    stroke-width: 1px;
    stroke: black;
    fill: transparent;
  }

  g.context path.area {
    fill: color.adjust($clr-primary, $lightness: 78%);

    &.contrast {
      fill: coral;
      stroke: red;
    }
  }

  g.context rect {
    fill: transparent;
  }

  g.context circle.pointer {
    opacity: 0;

    &.active {
      opacity: 1;
    }

    &.contrast {
      fill: red;
    }
  }

  g.context .peak text {
    font-size: 11px;
  }

  g.brush {
    rect.selection {
      fill: $clr-accent;
      stroke: $clr-accent;
    }
  }
}
</style>
