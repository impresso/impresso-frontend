<template lang="html">
  <div class="tooltip" v-bind:class='{active: tooltip.isActive}' v-bind:style="style">
    <div class="tooltip-inner p-3 m-2">
      <label>{{ $t('topic')}} &mdash; {{tooltip.item.model}}</label>
      <div>
        <span class='badge'> {{tooltip.item.language}}</span>
        <b class='sans-serif'>{{tooltip.item.excerpt}}</b></div>
    </div>
  </div>
</template>

<script>
export default {

  model: {
    prop: 'tooltip',
    default: {
      x: 0,
      y: 0,
      count: 0,
      isActive: false,
      item: {},
    },
  },
  props: ['tooltip', 'isActive'],
  computed: {
    style() {
      return {
        transform: `translate(${this.tooltip.x}px,${this.tooltip.y}px`,
      };
    },
  },
};
</script>

<style scoped lang="less">
.tooltip{
  position: absolute;
  top: 0;
  pointer-events: none;

  .tooltip-inner{
    background: black;
    color: white;
    text-align: left;
  }
  &.active{
    opacity: 1;
  }
}
// @tt_width: 100px;
// @tt_margin_h: 6px;
// @tt_margin_v: 3px;
//
// .tooltip{
//   ::before{
//     content: "";
//     display: block;
//     width: 10px;
//     height: 10px;
//     position: absolute;
//     top:44px;
//     left: @tt_width / 2 - @tt_margin_h;
//     transform: rotate(45deg);
//     background: black;
//   }
//
//   &.active{
//     opacity: 1;
//   }
//
//   position: absolute;
//   top: 0;
//   z-index: 100;
//   background: black;
//   border-radius: 3px;
//   color: white;
//   pointer-events: none;
//   width: @tt_width;
//   height: 50px;
//   margin-top: -56px;
//   margin-left: -1 * (@tt_width / 2);
//   font-size: .8em;
//   padding:3px 6px;
//   .year{
//     display: block;
//     font-weight: bold;
//     opacity: .8;
//   }
//   .count{
//
//   }
// }
</style>
