<template lang="html">
<main v-bind:style="style">
  <slot></slot>
</main>
</template>

<script>
export default {
  props: {
    width: {
      default: false, // 50vw, 768px, 80%
    },
    minWidth: {
      default: false,
    },
    maxWidth: {
      default: false,
    },
  },
  computed: {
    style() {
      const style = {};

      if (this.width) {
        style.width = this.width;
      }

      if (this.minWidth) {
        style['min-width'] = this.minWidth;
      }

      if (this.maxWidth) {
        style['max-width'] = this.maxWidth;
      }

      return style;
    },
  },
};
</script>

<style scoped lang="less">
main {
    height: 100%;
    display: flex;
    margin: 0 auto;
    > section{
      overflow-y: auto;
      &::-webkit-scrollbar {
          display: none;
      }
    }
}
</style>
