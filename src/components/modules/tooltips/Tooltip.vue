<template>
  <div
    class="Tooltip"
    :class="{ active: isActive }"
    :style="{
      transform: `translate(${x}px, ${y}px)`
    }"
  >
    <div class="tooltip-wrapper" ref="wrapper">
      <div class="tooltip-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @typedef {{ x: number, y: number, isActive: boolean }} TooltipProperties
 */

export default {
  name: 'Tooltip',
  props: {
    /** @type {import('vue').PropOptions<TooltipProperties>} */
    tooltip: {
      type: Object,
      required: true,
      default: () => ({
        x: 0,
        y: 0,
        isActive: false
      })
    },
    maxWidth: {
      type: Number,
      default: 200
    },
    /* calculate Y value instead of taking it from tooltip. */
    calculateY: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isActive() {
      return this.tooltip.isActive
    },
    /** @returns {number} */
    x() {
      const { width = null } =
        this.$el && this.$el.parentNode ? this.$el.parentNode.getBoundingClientRect() : {}

      if (width == null) return this.tooltip.x

      const { width: tooltipWidth = this.maxWidth } =
        this.$refs.wrapper?.getBoundingClientRect?.() ?? {}

      const halfTooltipWidth = tooltipWidth / 2

      if (this.tooltip.x < halfTooltipWidth) return halfTooltipWidth
      if (this.tooltip.x > width - halfTooltipWidth) return width - halfTooltipWidth

      return this.tooltip.x
    },
    /** @returns {number} */
    y() {
      if (!this.calculateY) return this.tooltip.y

      const { top = 0 } = this.$el?.parentNode?.getBoundingClientRect() ?? {}
      const { height = 0 } = this.$refs.wrapper?.getBoundingClientRect() ?? {}

      return this.tooltip.y + top - height * 2
    }
  }
}
</script>

<style lang="less">
.Tooltip {
  position: absolute;
  top: 0;
  pointer-events: none;
  z-index: 1071;
  opacity: 0;
  font-size: var(--impresso-font-size-smaller);

  &.active.fadeOut,
  &.fadeOut {
    transition: opacity 0.2s ease-in-out;
    opacity: 0;
  }
  .tooltip-wrapper {
    width: 200px;
    position: absolute;
    left: -100px;
    text-align: center;
  }

  .tooltip-inner {
    background: black;
    color: white;
    text-align: left;
    display: inline-block;
    padding: var(--spacing-2) var(--spacing-2-5);
    border-radius: var(--impresso-border-radius-xs);
  }

  p {
    color: #eee;
    margin-bottom: 0;
  }
  .tooltip-inner h1 {
    color: white;
    font-size: 1rem;
    font-weight: bold;
    border-bottom: 1px solid #999;
    padding-bottom: 0.75rem;
  }

  &.active {
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
