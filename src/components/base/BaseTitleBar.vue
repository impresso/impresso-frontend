<template lang="html">
  <div class="titlebar border-bottom mb-2">
    <div class="titlebar-inner border-bottom">
      <div class="titlebar-title">
        <div class="title">
            <slot></slot>
        </div>
      </div>
      <div class="titlebar-actions mb-1">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
.titlebar {
  border-color: $clr-secondary !important;
}
.titlebar-inner {
  border-color: $clr-tertiary !important;
  display: grid;
  grid-template-areas: 'title actions';
  grid-template-columns: auto max-content;
  margin-bottom: 1px;
  .titlebar-title {
    grid-area: 'title';
    color: $clr-secondary;
    line-height: 2;
    font-variant: all-small-caps;
    font-weight: bold;
    font-size: 0.9em;
  }
  .titlebar-actions {
    grid-area: 'actions';
  }
}
</style>
