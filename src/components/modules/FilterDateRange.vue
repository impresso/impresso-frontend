<template lang="html">
  <filter-wrapper v-bind:title="$t('daterange')" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <div class="body">
        <div class="row">
          <div class="col">
            <b-form-group label="Start">
              <b-form-input type="text" id="y1" v-model="filter.daterange.start" v-on:input="updateFilter"></b-form-input>
            </b-form-group>
          </div>
          <div class="col">
            <b-form-group label="End">
              <b-form-input type="text" id="y2" v-model="filter.daterange.end" v-on:input="updateFilter"></b-form-input>
            </b-form-group>
          </div>
        </div>
      </div>
    </div>
    <pre>{{filter}}</pre>
  </filter-wrapper>
</template>

<script>
import FilterWrapper from './FilterWrapper';

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
    submitFilter() {
      this.$emit('submit');
    },
    remove() {
      this.$emit('remove');
    },
  },
  components: {
    FilterWrapper,
  },
};
</script>

<style lang="css">
</style>
