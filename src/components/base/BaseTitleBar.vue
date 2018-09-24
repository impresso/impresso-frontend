<template lang="html">
  <div class="titlebar">
    <div class="titlebar-title"><slot></slot></div>
    <div class="titlebar-actions"><slot name="actions"></slot></div>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss">

@import "impresso-theme/src/scss/variables.sass";

.titlebar {
  float: none;
  border-bottom: 1px solid $clr-secondary;
  box-shadow: inset 0 -1px 0 0 white, inset 0 -2px 0 0 $clr-tertiary;
  display: block;
  min-height: 2em;
  padding-bottom: 0.5em;
  margin-bottom: 0.5em;
  .titlebar-title {
    float: left;
    padding-top: 0.2em;
    color: $clr-secondary;
    font-variant: all-small-caps;
    font-weight: bold;
    font-size: 0.9em;
  }
  .titlebar-actions {
    text-align: right;
  }
}
</style>
