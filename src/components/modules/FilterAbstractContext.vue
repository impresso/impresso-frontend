<template lang="html">
  <div class="filter-context">
    <b-form-select v-model="filter.context" :options="options" class="mb-3" />
  </div>
</template>

<script>
export default {
  model: {
    prop: 'filter',
  },
  props: ['filter', 'options'],
};
</script>

<style lang="less">
</style>
