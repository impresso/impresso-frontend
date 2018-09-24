<template lang="html">
  <filter-wrapper v-bind:title="$t(`label.${filter.type}`)" v-on:remove="remove">

  </filter-wrapper>
</template>

<script>
import FilterWrapper from './FilterWrapper';

export default {
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  components: {
    FilterWrapper,
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "label": {
      "year": "Year",
      "newspaper": "Newspaper Title"
    }
  },
  "nl": {
    "label": {
      "year": "Jaar",
      "newspaper": "Krant"
    }
  }
}
</i18n>
