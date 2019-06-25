<template lang="html">
  <div class="d3-timeline">
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
    fillYears() {
      if (!this.values.length) {
        return [];
      }
      // add zeroes to values array. Use the current extent.
      const values = [this.values[0]];

      for (let i = 1, l = this.values.length; i < l; i += 1) {
        // if year ...
        const diff = this.values[i].t - this.values[i - 1].t;
        for (let j = 1; j < diff; j += 1) {
          values.push({
            t: this.values[i - 1].t + j,
            w: 0,
            w1: 0,
          });
        }
        values.push(this.values[i]);
      }
      return values;
    },
  },
  mounted() {
    if (this.contrast) {
      this.timeline = new ContrastTimeline({
        element: '.d3-timeline',
        margin: {
          left: 10,
          right: 10,
          top: 10,
        },
        domain: this.domain,
      });
    } else {
      this.timeline = new Timeline({
        element: '.d3-timeline',
        margin: {
          left: 10,
          right: 10,
          top: 10,
        },
        domain: this.domain,
        brushable: true,
      });
    }
    this.timeline.on('mouseleave', () => {
      this.tooltip.isActive = false;
    });

    this.timeline.on('mousemove', (data) => {
      console.log('moooove', data.pointer, data.mouse);
      this.moveTooltip(data);
      this.$emit('highlight', data);
    });

    this.timeline.on('brushed', (data) => {
      this.$emit('brushed', data);
    });

    this.timeline.on('highlighted', (data) => {
      this.moveTooltip(data);
    });

    if (this.values && this.values.length) {
      this.timeline.update({
        data: this.fillYears(),
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
    highlight: {
      immediate: false,
      handler(val) {
        this.timeline.highlight(val);
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
      handler(val) {
        if (this.timeline) {
          this.timeline.update({
            data: val,
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
    height: 80px;
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
<i18n>
{
  "en": {
    "pages": {
      "total": "pages",
      "empty": "not available"
    }
  }
}
</i18n>
