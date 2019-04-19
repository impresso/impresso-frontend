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
        hspace: this.line.width,
      };
    },
    onResize() {
      this.line.resize();
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
      this.line = new ContrastTimeline({
        element: '.d3-timeline',
        margin: {
          left: 10,
          right: 10,
          top: 10,
        },
        domain: this.domain,
      });
    } else {
      this.line = new Timeline({
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
    this.line.on('mouseleave', () => {
      this.tooltip.isActive = false;
    });

    this.line.on('mousemove', (data) => {
      this.moveTooltip(data);
      this.$emit('highlight', data);
    });

    this.line.on('highlighted', (data) => {
      this.moveTooltip(data);
    });

    if (this.values && this.values.length) {
      this.line.update({
        data: this.fillYears(),
      });
      this.line.draw();
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
        this.line.highlight(val);
      },
    },
    brush: {
      immediate: false,
      handler(val) {
        if (this.line && val.length) {
          console.log('brush changed', val);
          this.line.brushTo({
            min: val[0],
            max: val[1],
          });
          // this.line.drawBrush();
        }
      },
    },
    values: {
      immediate: false,
      handler(val) {
        if (this.line) {
          this.line.update({
            data: val,
          });
          this.line.draw();
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
