<template lang="html">
  <div class="titlebar pb-2 mb-3 border-bottom">
    <div class="titlebar-title small-caps"><slot></slot></div>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.titlebar {
  padding-top:1px;
  // border-color: $clr-tertiary !important;
}
</style>
