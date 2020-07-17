<template lang="html">
  <div class="line-pointer" :style="style">
    <div v-if="label" class="line-pointer-label"><span>{{label}}</span></div>
  </div>
</template>

<script>
export default {
  props: {
    x: Number,
    height: Number,
    label: String,
    width: {
      type: Number,
      default: 1,
    },
    backgroundColor: {
      type: String,
      default: '#000000',
    },
  },
  computed: {
    style() {
      return {
        transform: `translateX(${this.x}px)`,
        width: `${this.width}px`,
        backgroundColor: this.backgroundColor,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.line-pointer {
  position: absolute;
  height: 100%;
  top: 0;
  pointer-events: none;
  &.active.fadeOut, &.fadeOut{
    transition: opacity .2s ease-in-out;
    opacity: 0;
  }
  .line-pointer-label{
    position: absolute;
    top: 0;
    width: 50px;
    left: -25px;
    font-size:12px;
    text-align: center;
    >span{
      background: black;
      color: white;
      padding: 0 0.25rem;
      border-radius: 0.1rem
    }
  }
}
</style>
