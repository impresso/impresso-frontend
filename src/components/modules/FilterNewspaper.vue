<template lang="html">
  <filter-wrapper
    v-on:remove="remove"
    v-bind:id="filter.key"
    icon="pamphlet"
    v-bind:title="filter.newspaper.name">
    <div slot="settings">
      <filter-setting-context v-model="filter" />
    </div>
  </filter-wrapper>
</template>

<script>
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
