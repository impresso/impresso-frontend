<template lang="html">
  <b-form-group label="Inclusion">
    <b-form-radio-group
      stacked
      v-model="filter.context"
      v-bind:options="options">
    </b-form-radio-group>
  </b-form-group>
</template>

<script>
import * as contexts from '@/models/Contexts';

export default {
  computed: {
    options() {
      return Object.keys(contexts).map(key => ({
        value: contexts[key],
        text: this.$t(contexts[key]),
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
    "include": "Include",
    "exclude": "Exclude"
  },
  "nl": {
    "include": "Inclusief",
    "exclude": "Exclusief"
  }
}
</i18n>
