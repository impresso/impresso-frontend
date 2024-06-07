<template lang="html">
  <filter-wrapper
    v-bind:id="filter.key"
    v-on:remove="remove"
    icon="archive"
    v-bind:title="filter.item.name">
    <template v-slot:settings>
      <filter-setting-context v-model="filter" />
    </template>
  </filter-wrapper>
</template>

<script>
/**
 * @deprecated Not used anywhere.
 */

import FilterWrapper from './FilterWrapper';
import FilterSettingContext from './FilterSettingContext';

export default {
  data: () => ({
    disabled: true,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    remove() {
      this.$emit('remove');
    },
  },
  components: {
    FilterWrapper,
    FilterSettingContext,
  },
};
</script>
