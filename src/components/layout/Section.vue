<template lang="html">
  <section v-bind:style="style">
    <div v-if="this.$slots.header" class="header">
      <slot name="header"></slot>
    </div>
    <div class="body">
      <slot></slot>
    </div>
    <div v-if="this.$slots.footer" class="footer">
      <slot name="footer">
      </slot>
    </div>
  </section>
</template>

<script>
/*
<i-layout-section width="400px" />
*/
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
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content auto min-content;
  grid-template-areas: "header" "body" "footer";
  height: 100%;
  >.header{
    grid-area: header;
  }
  >.body{
      grid-area: body;
      overflow-y: auto;
      &::-webkit-scrollbar {
        display: none;
      }
  }
  > .footer{
      grid-area: footer;
  }
}
</style>
