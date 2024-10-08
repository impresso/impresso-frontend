<template lang="html">
  <filter-wrapper v-on:remove="remove" v-bind:id="filter.key" icon="pamphlet" v-bind:title="filter.newspaper.name">
    <template v-slot:settings>
      <filter-setting-context :modelValue="filter" />
    </template>
  </filter-wrapper>
</template>

<script>
/**
 * @deprecated Not used anywhere.
 */

import FilterWrapper from '@/components/modules/FilterWrapper.vue';
import FilterSettingContext from '@/components/modules/FilterSettingContext.vue';

export default {
  data: () => ({
    disabled: true,
  }),
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
