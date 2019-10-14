<template lang="html">
  <span class="info-button">
    <span class="icon-link dripicons-information" :id="`ib_${target}`"></span>
    <b-popover :target="`ib_${target}`" triggers="click" placement="right" class="drop-shadow">
      <template v-slot:title class="text-bold">{{name}}</template>
      <div v-html="content" />
    </b-popover>
  </span>
</template>

<script>
export default {
  props: ['target', 'name', 'content'],
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.arrow {
  border-color: $clr-secondary;
}
.popover-header,
.popover-body {
background: $clr-secondary;
color: $clr-white;
  a {
    color: $clr-white;
    text-decoration: underline;
  }
}
</style>
