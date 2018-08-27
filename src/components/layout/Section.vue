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
      if (this.width === 'auto') {
        return {
          flex: 'auto',
        };
      }
      return {
        flex: `0 0 ${this.width}`,
      };
    },
  },
};
</script>
