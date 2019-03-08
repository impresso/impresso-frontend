<template lang="html">
  <div id="d3-timeline">
    <tooltip v-bind:tooltip="tooltip">
      <div v-if="tooltip.item">{{ $d(tooltip.item.t, 'year') }} &middot; <b>{{ tooltip.item.w }}</b> {{ $t('pages') }}</div>
    </tooltip>
  </div>
</template>

<script>
import Timeline from '@/d3-modules/Timeline';
import Tooltip from './tooltips/Tooltip';

export default {
  props: {
    values: Array,
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
        y: data.pointer.y - 5,
        hspace: this.line.width,
      };
    },
  },
  mounted() {
    this.line = new Timeline({
      element: '#d3-timeline',
      margin: {
        left: 50,
        right: 50,
        top: 30,
      },
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
    }
  },
  watch: {
    highlight: {
      immediate: false,
      handler(val) {
        console.log('@highlight', val);
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
  #d3-timeline{
    width: 100%;
    height: 80px;
    position: relative;

    g.context path.area {
      stroke-width: 1px;
      stroke: black;
      fill: transparent;
    }
    g.context rect{
      fill: transparent;
    }
    g.context circle.pointer{
      opacity: 0;
      &.active{
        opacity: 1;
      }
    }
  }
</style>
