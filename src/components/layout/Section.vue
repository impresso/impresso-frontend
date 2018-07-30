<template lang="html">
  <section v-bind:style="style">
    <slot></slot>
  </section>
</template>

<script>
export default {
  props: {
    width: {
      default: 'auto',
    },
  },
  computed: {
    style() {
      return {
        width: this.width,
      };
    },
  },
};
</script>

<style scoped lang="less">
section{
  overflow-y: auto;
  &::-webkit-scrollbar {
      display: none;
  }
}
</style>
