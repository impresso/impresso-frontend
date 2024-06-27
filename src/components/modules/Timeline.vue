<template>
  <div class="d3-timeline" ref="timeline" :style="`height: ${heightVal}`" :data-testid="dataTestid">
    <tooltip :tooltip="tooltip">
      <slot :tooltip="{ ...tooltip, item }">
        <div v-if="item">
          {{ item }}
        </div>
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

const getTimeFormatForResolution = resolution =>
  resolution === 'day' ? '%d %b %Y' : resolution === 'month' ? '%B %Y' : '%Y'

export default {
  name: 'Timeline',
  props: {
    values: Array,
    brush: Array, // brush values
    domain: Array,
    highlight: Object,
    contrast: Boolean,
    percentage: Boolean,
    highlightEnabledState: Boolean,
    brushable: {
      type: Boolean,
      default: true,
    },
    height: {
      type: String,
      default: '85px',
    },
    resolution: {
      type: String,
      default: 'year',
      validator(value) {
        return [undefined, 'year', 'month', 'day'].includes(value)
      },
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
    item: {},
  }),
  computed: {
    heightVal() {
      if (typeof this.height === 'string') return this.height
      return 'auto'
    },
  },
  methods: {
    moveTooltip(data) {
      this.tooltip = {
        isActive: true,
        x: data.pointer.x + 50,
        y: data.pointer.y - 50,
      }
      this.item = data.datum
    },
    onResize() {
      this.timeline.resize()
    },
  },
  mounted() {
    if (this.contrast) {
      this.timeline = new ContrastTimeline({
        element: this.$refs.timeline,
        margin: {
          left: 10,
          right: 10,
          top: 15,
        },
        domain: this.domain,
        format: getTimeFormatForResolution(this.resolution),
      })
    } else {
      this.timeline = new Timeline({
        element: this.$refs.timeline,
        margin: {
          left: 10,
          right: 10,
          top: 15,
        },
        domain: this.domain,
        brushable: this.brushable,
        format: getTimeFormatForResolution(this.resolution),
      })
      setTimeout(() => this.timeline.resize(), 0)
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

    if (this.percentage) {
      this.timeline.dimensions.y.property = 'p'
    }

    if (this.values && this.values.length) {
      this.timeline.update({
        data: this.values,
      })

      this.timeline.draw()
      // check brush
      if (this.brush && this.brush.length) {
        const [min, max] = this.brush
        this.timeline.brushTo({
          min,
          max,
        })
      }

      setTimeout(this.onChangeDomain, 5000)
    }
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  watch: {
    percentage: {
      immediate: false,
      handler() {
        if (this.timeline) {
          this.timeline.dimensions.y.property = this.percentage ? 'p' : 'w'
          this.timeline.update({
            data: this.values,
          })
          this.timeline.draw()
        }
      },
    },
    highlight: {
      immediate: false,
      handler(val) {
        this.timeline.highlight(val)
      },
    },
    highlightEnabledState: {
      immediate: false,
      handler(val) {
        this.tooltip.isActive = val
      },
    },
    brush: {
      immediate: false,
      handler(val) {
        if (this.timeline && val.length) {
          const [min, max] = val
          this.timeline.brushTo({
            min,
            max,
          })
        }
      },
    },
    values: {
      immediate: true,
      deep: true,
      handler(data) {
        if (this.timeline) {
          this.timeline.update({
            data,
          })
          this.timeline.draw()

          if (this.brush && this.brush.length) {
            const [min, max] = this.brush
            this.timeline.brushTo({
              min,
              max,
            })
          }
        }
      },
    },
    resolution: {
      handler(resolution) {
        this.timeline.updateTimeFormat(getTimeFormatForResolution(resolution))
        this.timeline.draw()
      },
    },
  },
  components: {
    Tooltip,
  },
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

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

    rect.handle {
      // fill: $clr-accent;
    }

    rect.handle--e {}
  }
}
</style>
