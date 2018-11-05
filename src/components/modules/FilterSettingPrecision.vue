<template lang="html">
  <b-form-group label="Precision">
    <b-form-radio-group
      stacked
      v-model="filter.precision"
      v-bind:options="options">
    </b-form-radio-group>
  </b-form-group>
</template>

<script>
import * as precisions from '@/models/Precisions';

export default {
  computed: {
    options() {
      return Object.keys(precisions).map(key => ({
        value: precisions[key],
        text: this.$t(precisions[key]),
      }));
    },
  },
  model: {
    prop: 'filter',
  },
  props: ['filter'],
};
</script>

<i18n>
{
  "en": {
    "regular": "Regular",
    "case_sensitive": "Case Sensitive",
    "fuzzy": "Fuzzy"
  },
  "nl": {
    "regular": "Regular",
    "case_sensitive": "Case Sensitive",
    "fuzzy": "Fuzzy"
  }
}
</i18n>
