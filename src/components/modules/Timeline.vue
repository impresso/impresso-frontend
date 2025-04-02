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

<script>
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
import Tooltip from './tooltips/Tooltip.vue'
import * as d3 from 'd3'
import Dimension from '@/d3-modules/Dimension'

const getTimeFormatForResolution = resolution =>
  resolution === 'day' ? '%d %b %Y' : resolution === 'month' ? '%B %Y' : '%Y'

export default {
  name: 'Timeline',
  props: {
    values: Array,
    brush: Array, // brush values
    domain: Array,
    exponent: {
      type: Number,
      default: 1
    },
    highlight: Object,
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
      type: String,
      default: 'year',
      validator(value) {
        return [undefined, 'year', 'month', 'day'].includes(value)
      }
    },
    dataTestid: {
      type: String,
      default: 'timeline'
    }
  },
  data: () => ({
    tooltip: {
      x: 0,
      y: 0,
      isActive: false
    },
    item: {}
  }),
  computed: {
    heightVal() {
      if (typeof this.height === 'string') return this.height
      return 'auto'
    }
  },
  methods: {
    moveTooltip(data) {
      this.tooltip = {
        isActive: true,
        x: data.pointer.x + 50,
        y: data.pointer.y - 50,
        item: data.datum
      }
    },
    onResize() {
      this.timeline.resize()
    },
    forceTimelineUpdate() {
      if (!this.timeline) {
        console.warn('Timeline not initialized.')
        return
      }
      if (!this.values) {
        console.warn('No values provided to the timeline.')
        return
      }
      this.timeline.dimensions.y.domain[0] = 0
      this.timeline.dimensions.y.domain[1] = d3.max(
        this.values,
        d => d[this.timeline.dimensions.y.property]
      )
      this.timeline.update({
        data: this.values
      })
      this.timeline.draw()
    }
  },
  mounted() {
    const dimensions = {
      x: new Dimension({
        name: 'x',
        property: 't',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scaleTime
      }),
      y: new Dimension({
        name: 'y',
        property: this.percentage ? 'p' : 'w',
        type: Dimension.TYPE_CONTINUOUS,
        scaleFn: d3.scalePow,
        autoCalculateDomain: false,
        exponent: 1,
        isScalePow: true
      })
    }
    const contextPeakTextFn = v => {
      if (this.percentage) {
        return this.$n(v) + '%'
      }
      return this.$n(v)
    }
    if (this.contrast) {
      this.timeline = new ContrastTimeline({
        element: this.$refs.timeline,
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
        element: this.$refs.timeline,
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
      setTimeout(() => {
        this.forceTimelineUpdate()
        this.timeline.resize()
      }, 0)
    }
    this.timeline.on('mouseleave', () => {
      this.tooltip.isActive = false
      this.$emit('highlight-off')
    })

    this.timeline.on('mousemove', data => {
      this.moveTooltip(data)
      this.$emit('highlight', data)
    })

    this.timeline.on('brushed', data => {
      if (this.timelineTimer) {
        clearTimeout(this.timelineTimer)
      }
      this.timelineTimer = setTimeout(() => {
        this.$emit('brushed', data)
      }, 50)
      this.$emit('brushing', data)
    })

    this.timeline.on('brush-end', data => {
      this.$emit('brush-end', data)
    })

    this.timeline.on('highlighted', data => {
      this.moveTooltip(data)
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
      handler(val) {
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
      handler(val) {
        this.timeline.highlight(val)
      }
    },
    highlightEnabledState: {
      immediate: false,
      handler(val) {
        this.tooltip.isActive = val
      }
    },
    brush: {
      immediate: false,
      handler(val) {
        if (this.timeline && val.length) {
          const [min, max] = val
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
      handler(data) {
        if (this.timeline) {
          this.forceTimelineUpdate()

          if (this.brush && this.brush.length) {
            const [min, max] = this.brush
            this.timeline.brushTo({
              min,
              max
            })
          }
        }
      }
    },
    resolution: {
      handler(resolution) {
        this.timeline.updateTimeFormat(getTimeFormatForResolution(resolution))
        this.timeline.draw()
      }
    }
  },
  components: {
    Tooltip
  }
}
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
    fill: lighten($clr-primary, 78);

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
