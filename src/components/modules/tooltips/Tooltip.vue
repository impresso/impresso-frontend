<template lang="html">
  <div class="tooltip" :class='{active: tooltip.isActive}' :style="{
      transform: `translate(${x}px, ${this.tooltip.y}px`,
    }">
    <div class="tooltip-wrapper">
      <div class="tooltip-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {

    tooltip: {
      required: true,
      default: {
        x: 0,
        y: 0,
        hspace: 1000,
      },
    },
    maxWidth: {
      type: Number,
      default: 200,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    x() {
      const x0 = Math.min(this.tooltip.x, this.tooltip.hspace - (this.maxWidth / 2));
      return Math.max(this.maxWidth / 2, x0);
    },
  },
};
</script>

<style scoped lang="less">
.tooltip{
  position: absolute;
  top: 0;
  pointer-events: none;

  .tooltip-wrapper{
    width: 200px;
    position: absolute;
    left: -100px;
    text-align: center;
  }

  .tooltip-inner{
    background: black;
    color: white;
    text-align: left;
    display: inline-block;
  }

  p{
    color: #eee;
    margin-bottom: 0;
  }
  .tooltip-inner h1{
    color: white;
    font-size: 1rem;
    font-weight: bold;
    border-bottom: 1px solid #999;
    padding-bottom: .75rem;
  }

  &.active{
    opacity: 1;
  }
}
// .tooltip::after {
//   content: " ";
//   position: absolute;
//   top: 100%; /* At the bottom of the tooltip */
//   left: 50%;
//   margin-left: -5px;
//   border-width: 10px;
//   border-style: solid;
//   border-color: black transparent transparent transparent;
// }
</style>
