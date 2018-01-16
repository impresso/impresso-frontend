<template lang="html">
  <div class="filter">
    <div class="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="body">
      <b-input type="text" v-model="filter.query" v-on:input="updateFilter" />
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    options: [{
      value: 'include',
      text: 'Include',
    },
    {
      value: 'exclude',
      text: 'Exclude',
    }],
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
    },
  },
};
</script>

<style lang="css">
</style>
