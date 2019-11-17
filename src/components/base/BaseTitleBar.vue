<template lang="html">
  <div class="tb pb-2 mb-2" :class="getClasses">
    <div class="tb-heading">
      <div class="tb-title" :class="{'small-caps': smallCaps, 'font-weight-bold': true}">
        <slot></slot>
      </div>
      <div class="tb-description">
        <slot name="description"></slot>
      </div>
    </div>
    <div class="tb-options">
      <slot name="options"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    smallCaps: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    getClasses() {
      return {
        'with-options': !!this.$slots.options,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.tb {
  padding-top:1px;
}

.tb-description {
  font-size: smaller;
}

.tb.with-options {
  display: flex;
  align-items: center;

  .tb-heading {
    flex-grow: 1;
  }
  .tb-options {
    text-align: right;
  }
  .tb-description {
    clear: both;
  }
}
</style>
