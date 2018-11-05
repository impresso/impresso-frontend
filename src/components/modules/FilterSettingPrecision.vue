<template lang="html">
  <b-form-group v-bind:label="$t('title')">
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
    "title": "Precision",
    "regular": "Regular",
    "case_sensitive": "Case Sensitive",
    "fuzzy": "Fuzzy"
  },
  "nl": {
    "title": "Nauwkeurigheid",
    "regular": "Normaal",
    "case_sensitive": "Hoofdlettergevoelig",
    "fuzzy": "Fuzzy"
  }
}
</i18n>
