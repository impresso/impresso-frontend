<template lang="html">
  <filter-wrapper v-bind:id="filter.key" v-on:remove="remove" icon="archive" v-bind:title="filter.item.name">
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
