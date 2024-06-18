<template lang="html">
  <filter-wrapper v-on:remove="remove" v-bind:id="filter.key" icon="web"
    v-bind:title="$t(`languages.${filter.language.uid}`)">
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
