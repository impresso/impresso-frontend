<template lang="html">
  <div class="filter">
    <div class="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="body">
      <div class="row">
        <div class="col">
          <b-form-group label="Start">
            <b-form-input type="number" id="y1" v-model="filter.start" v-on:input="updateFilter"></b-form-input>
          </b-form-group>
        </div>
        <div class="col">
          <b-form-group label="End">
            <b-form-input type="number" id="y2" v-model="filter.end" v-on:input="updateFilter"></b-form-input>
          </b-form-group>
        </div>
      </div>
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
