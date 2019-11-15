<template lang="html">
  <div class="d3-timeline" ref="timeline">
    <tooltip :tooltip="tooltip">
      <slot :tooltip="tooltip">
        <div v-if="tooltip.item">
          {{tooltip.item}}
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
   <div slot-scope="tooltipScope">
     <div v-if="tooltipScope.tooltip.item">
       {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
       <b>{{ tooltipScope.tooltip.item.w }}</b> {{ localComputedVar }}
     </div>
   </div>
 </timeline>
*/

import ContrastTimeline from '@/d3-modules/ContrastTimeline';
import Timeline from '@/d3-modules/Timeline';
import Tooltip from './tooltips/Tooltip';

export default {
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
  },
  data: () => ({
    tooltip: {
      x: 0,
      y: 0,
      isActive: false,
      item: {},
    },
  }),
  methods: {
    moveTooltip(data) {
      this.tooltip = {
        item: data.datum,
        isActive: true,
        x: data.pointer.x + 50,
        y: data.pointer.y - 50,
        hspace: this.timeline.width,
      };
    },
    onResize() {
      this.timeline.resize();
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
      });
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
      });
    }
    this.timeline.on('mouseleave', () => {
      this.tooltip.isActive = false;
      this.$emit('highlight-off');
    });

    this.timeline.on('mousemove', (data) => {
      this.moveTooltip(data);
      this.$emit('highlight', data);
    });

    this.timeline.on('brushed', (data) => {
      if (this.timelineTimer) {
        clearTimeout(this.timelineTimer);
      }
      this.timelineTimer = setTimeout(() => {
        this.$emit('brushed', data);
      }, 50);
      this.$emit('brushing', data);
    });

    this.timeline.on('highlighted', (data) => {
      this.moveTooltip(data);
    });

    if (this.percentage) {
      this.timeline.dimensions.y.property = 'p';
    }

    if (this.values && this.values.length) {
      this.timeline.update({
        data: this.values,
      });


      this.timeline.draw();
      setTimeout(this.onChangeDomain, 5000);
    }
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  watch: {
    percentage: {
      immediate: false,
      handler() {
        debugger;
        if (this.timeline) {
          this.timeline.dimensions.y.property = 'p';
          this.timeline.update({
            data: this.values,
          });
          this.timeline.draw();
        }
      },
    },
    highlight: {
      immediate: false,
      handler(val) {
        this.timeline.highlight(val);
      },
    },
    highlightEnabledState: {
      immediate: false,
      handler(val) {
        this.tooltip.isActive = val;
      },
    },
    brush: {
      immediate: false,
      handler(val) {
        if (this.timeline && val.length) {
          this.timeline.brushTo({
            min: val[0],
            max: val[1],
          });
          // this.timeline.drawBrush();
        }
      },
    },
    values: {
      immediate: false,
      deep: true,
      handler(data) {
        // console.info('Timeline component received data:', data.length);
        if (this.timeline) {
          this.timeline.update({
            data,
          });
          this.timeline.draw();
        }
      },
    },
  },
  components: {
    Tooltip,
  },
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  .d3-timeline{
    width: 100%;
    height: 85px;
    position: relative;

    g.context path.curve {
      stroke-width: 1px;
      stroke: black;
      fill: transparent;
    }

    g.context path.area {
      fill: lighten($clr-primary, 78);
      &.contrast{
        fill: coral;
        stroke: red;
      }
    }
    g.context rect{
      fill: transparent;
    }
    g.context circle.pointer{
      opacity: 0;
      &.active{
        opacity: 1;
      }
      &.contrast{
        fill: red;
      }
    }
    g.context .peak text{
      font-size: 11px;
    }
    g.brush {
      rect.selection {
        fill: $clr-accent;
        stroke: $clr-accent;
      }
      rect.handle{
        // fill: $clr-accent;
      }
      rect.handle--e{

      }
    }
  }
</style>
