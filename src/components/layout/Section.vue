<template lang="html">
  <section v-bind:style="style">
    <div v-bind:class="{'pb-4': this.$slots.footer}">
      <slot></slot>
    </div>
    <div v-if="this.$slots.footer" class="footer">
      <slot name="footer">
      </slot>
    </div>
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

<style scoped lang="less">
section{
  .footer{
      position: sticky;
      width: 100%;
      bottom: 0;
  }
}
</style>
