<template lang="html">
  <div id="d3-timeline">
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
import Tooltip from './tooltips/Tooltip';

export default {
  props: {
    values: Array,
    domain: Array,
    highlight: Object,
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
  },
  mounted() {
    this.line = new ContrastTimeline({
      element: '#d3-timeline',
      margin: {
        left: 10,
        right: 10,
        top: 10,
      },
      domain: this.domain,
    });

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
        data: this.values,
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

  #d3-timeline{
    width: 100%;
    height: 80px;
    position: relative;

    g.context path.area {
      stroke-width: 1px;
      stroke: black;
      fill: lighten($clr-primary, 78);
      &.contrast{
        fill: orange;
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
