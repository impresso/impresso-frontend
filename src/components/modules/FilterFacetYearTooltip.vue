<template lang="html">
  <div class="FilterFacetYearTooltip" v-bind:style="style">
    <span class="year">Year: {{ tooltip.year.getFullYear() }}</span>
    <span class="count">Count: {{ tooltip.count }}</span>
  </div>
</template>

<script>
/**
 * @deprecated Not used anywhere
 */

export default {
  props: {
    tooltip: {
      type: Object,
      required: true,
      default: () => ({
        x: 0,
        y: 0,
        year: new Date(),
        count: 0,
      }),
    }
  },
  computed: {
    style() {
      return {
        top: `${this.tooltip.y}px`,
        left: `${this.tooltip.x}px`,
      };
    },
  },
};
</script>

<style scoped lang="less">
@tt_width: 100px;
@tt_margin_h: 6px;
@tt_margin_v: 3px;

.FilterFacetYearTooltip {
  ::before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    position: absolute;
    top: 44px;
    left: @tt_width / 2 - @tt_margin_h;
    transform: rotate(45deg);
    background: black;
  }

  position: absolute;
  z-index: 100;
  background: black;
  border-radius: 3px;
  color: white;
  pointer-events: none;
  width: @tt_width;
  height: 50px;
  margin-top: -56px;
  margin-left: -1 * (@tt_width / 2);
  font-size: .8em;
  padding:3px 6px;

  .year {
    display: block;
    font-weight: bold;
    opacity: .8;
  }

  .count {}
}
</style>
