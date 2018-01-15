<template lang="html">
    <b-input type="text" v-model="filter.query" />
</template>

<script>
export default {
  model: {
    prop: 'filter',
  },
  props: ['filter'],
};
</script>

<style lang="css">
</style>
