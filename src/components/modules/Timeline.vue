<template>
  <div class="d3-timeline" ref="timeline" :style="`height: ${heightVal}`" :data-testid="dataTestid">
    <tooltip :tooltip="tooltip">
      <!-- "meta" tooltip -->
      <slot :tooltip="tooltip">
        <div v-if="tooltip.item">{{ tooltip.item }}</div>
      </slot>
    </tooltip>
  </div>
</template>

<script lang="ts">
/**

 Usage with custom tooltip (local computed variable)
 <timeline :values="values"
   :brush="[startDaterange, endDaterange]"
   :domain="[startYear, endYear]"
   @brushed="afterBrush()">
   <template v-slot="tooltipScope">
     <div v-if="tooltipScope.tooltip.item">
       {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
       <b>{{ tooltipScope.tooltip.item.w }}</b> {{ localComputedVar }}
     </div>
   </template>
 </timeline>
*/

import ContrastTimeline from '@/d3-modules/ContrastTimeline'
import Timeline from '@/d3-modules/Timeline'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import * as d3 from 'd3'
import Dimension from '@/d3-modules/Dimension'
import { defineComponent, PropType } from 'vue'

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
  on(event: string, handler: (data?: unknown) => void): TimelineInstance
  resize(): void
  update(payload: any): void
  draw(): void
  brushTo(payload: { min: TimelineBrushValue; max: TimelineBrushValue }): void
  highlight(datum: any): void
  updateTimeFormat(format: string): void
}

export interface IData {
  tooltip: {
    x: number
    y: number
    isActive: boolean
    item?: TimelineDatum
  }
  item: Record<string, unknown>
  timeline: TimelineInstance | null
  timelineTimer: ReturnType<typeof setTimeout> | null
}

const getTimeFormatForResolution = (resolution?: TimelineResolution) =>
  resolution === 'day' ? '%d %b %Y' : resolution === 'month' ? '%B %Y' : '%Y'

export default defineComponent({
  name: 'Timeline',
  props: {
    values: Array as PropType<object[]>,
    brush: Array as PropType<TimelineBrushRange>, // brush values
    domain: Array as PropType<TimelineDomainValue[]>,
    exponent: {
      type: Number,
      default: 1
    },
    highlight: Object as PropType<TimelineDatum | null>,
    contrast: Boolean,
    percentage: Boolean,
    highlightEnabledState: Boolean,
    brushable: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '85px'
    },
    resolution: {
      type: String as PropType<TimelineResolution>,
      default: 'year',
      validator(value: TimelineResolution | undefined): boolean {
        return [undefined, 'year', 'month', 'day'].includes(value)
      }
    },
    dataTestid: {
      type: String,
      default: 'timeline'
    }
  },
  data(): IData {
    return {
      tooltip: {
        x: 0,
        y: 0,
        isActive: false
      },
      item: {},
      timeline: null,
      timelineTimer: null
    }
  },
  computed: {
    heightVal(): string {
      if (typeof this.height === 'string') return this.height
      return 'auto'
    }
  },
  methods: {
    moveTooltip(data: TimelineInteractionPayload): void {
      this.tooltip = {
        isActive: true,
        x: data.pointer.x + 50,
        y: data.pointer.y - 50,
        item: data.datum
      }
    },
    onResize(): void {
      this.timeline?.resize()
    },
    forceTimelineUpdate(): void {
      if (!this.timeline) {
        console.warn('Timeline not initialized.')
        return
      }
      if (!this.values) {
        console.warn('No values provided to the timeline.')
        return
      }
      this.timeline.dimensions.y.domain[0] = 0
      const yProperty = this.timeline.dimensions.y.property
      this.timeline.dimensions.y.domain[1] = d3.max(this.values, d =>
        Number((d as Record<string, unknown>)[yProperty] ?? 0)
      ) as number
      this.timeline.update({
        data: this.values as TimelineDatum[]
      })
      this.timeline.draw()
    }
  },
  mounted() {
    const dimensions = {
      x: new Dimension<TimelineDatum>({
        name: 'x',
        property: 't',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scaleTime
      }),
      y: new Dimension<TimelineDatum>({
        name: 'y',
        property: this.percentage ? 'p' : 'w',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scalePow,
        autoCalculateDomain: false,
        exponent: 1,
        isScalePow: true
      })
    }
    const contextPeakTextFn = (v: number) => {
      if (this.percentage) {
        return this.$n(v) + '%'
      }
      return this.$n(v)
    }
    if (this.contrast) {
      this.timeline = new ContrastTimeline({
        element: this.$refs.timeline as HTMLElement,
        margin: {
          left: 10,
          right: 10,
          top: 15
        },
        domain: this.domain,
        format: getTimeFormatForResolution(this.resolution),
        dimensions,
        contextPeakTextFn
      })
    } else {
      this.timeline = new Timeline({
        element: this.$refs.timeline as HTMLElement,
        margin: {
          left: 10,
          right: 10,
          top: 15
        },
        domain: this.domain,
        brushable: this.brushable,
        format: getTimeFormatForResolution(this.resolution),
        dimensions,
        contextPeakTextFn
      })
    }
    setTimeout(() => {
      this.forceTimelineUpdate()
      this.timeline?.resize()
    }, 0)
    this.timeline.on('mouseleave', () => {
      this.tooltip.isActive = false
      this.$emit('highlight-off')
    })

    this.timeline.on('mousemove', data => {
      const typedData = data as TimelineInteractionPayload
      this.moveTooltip(typedData)
      this.$emit('highlight', typedData)
    })

    this.timeline.on('brushed', data => {
      const typedData = data as TimelineBrushedPayload
      if (this.timelineTimer) {
        clearTimeout(this.timelineTimer)
      }
      this.timelineTimer = setTimeout(() => {
        this.$emit('brushed', typedData)
      }, 50)
      this.$emit('brushing', typedData)
    })

    this.timeline.on('brush-end', data => {
      this.$emit('brush-end', data)
    })

    this.timeline.on('highlighted', data => {
      this.moveTooltip(data as TimelineInteractionPayload)
    })
    this.timeline.on('clear-selection', () => {
      this.$emit('clear-selection')
    })

    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  watch: {
    exponent: {
      immediate: false,
      handler(val: number) {
        if (this.timeline) {
          this.timeline.dimensions.y.exponent = val
          this.forceTimelineUpdate()
        }
      }
    },
    percentage: {
      immediate: false,
      handler() {
        if (this.timeline) {
          this.timeline.dimensions.y.property = this.percentage ? 'p' : 'w'
          this.forceTimelineUpdate()
        }
      }
    },
    highlight: {
      immediate: false,
      handler(val: TimelineDatum | null) {
        if (this.timeline && val) {
          this.timeline.highlight(val)
        }
      }
    },
    highlightEnabledState: {
      immediate: false,
      handler(val: boolean | undefined) {
        this.tooltip.isActive = Boolean(val)
      }
    },
    brush: {
      immediate: false,
      handler(val: TimelineBrushRange) {
        if (this.timeline && val.length >= 2) {
          const [min, max] = val
          if (min == null || max == null) {
            return
          }
          this.timeline.brushTo({
            min,
            max
          })
        }
      }
    },
    values: {
      immediate: true,
      deep: true,
      handler() {
        if (this.timeline) {
          this.forceTimelineUpdate()

          if (this.brush && this.brush.length >= 2) {
            const [min, max] = this.brush
            if (min == null || max == null) {
              return
            }
            this.timeline.brushTo({
              min,
              max
            })
          }
        }
      }
    },
    resolution: {
      handler(resolution: TimelineResolution | undefined) {
        if (!this.timeline) {
          return
        }
        this.timeline.updateTimeFormat(getTimeFormatForResolution(resolution))
        this.timeline.draw()
      }
    }
  },
  components: {
    Tooltip
  }
})
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
