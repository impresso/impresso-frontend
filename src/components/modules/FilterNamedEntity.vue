<template lang="html">
  <div class="filter">
    <div class="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="body">
      <icon v-if="filter.label === 'person'" name="user-circle"></icon>
      <icon v-if="filter.label === 'location'" name="map-marker"></icon>
      {{filter.title}}
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';

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
  components: {
    Icon,
  },
};
</script>

<style scoped lang="less">
  .filter{
    .body{
      padding: 5px 10px;
      .fa-icon{
        width: 12px;
        margin-bottom: -2px;
      }
    }
  }
</style>
