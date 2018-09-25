<template lang="html">
  <div class="titlebar pb-2 border-bottom mb-4">
    <div class="titlebar-title">
      <div class="title">
          <slot></slot>
      </div>
    </div>
    <div class="titlebar-actions">
      <slot name="actions"></slot>
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
  display: grid;
  grid-template-areas: 'title actions';
  grid-template-columns: auto max-content;
  .titlebar-title {
    grid-area: 'title';
    color: $clr-secondary;
    font-variant: all-small-caps;
    font-weight: bold;
    font-size: 0.9em;
    display: table;
    height: 100%;
    .title{
      display: table-cell;
      vertical-align: middle;
    }
  }
  .titlebar-actions {
    grid-area: 'actions';
  }
}
</style>
