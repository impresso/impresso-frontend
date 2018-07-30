<template lang="html">
<main>
  <slot></slot>
</main>
</template>

<script>
export default {};
</script>

<style scoped lang="less">
main {
  height: 100%;
  display: grid;
  grid-template-columns: max-content auto max-content ;
  grid-template-rows: auto;
}
</style>
