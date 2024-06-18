<template>
  <label>{{ $t('title') }}</label>
  <radio-group
    :modelValue="filter.context"
    :options="options"
    @update:modelValue="filter.context = $event"
    type="radio" />
</template>

<script>
import * as precisions from '@/models/Precisions';
import RadioGroup from '@/components/layout/RadioGroup.vue';

export default {
  computed: {
    filter() { return this.modelValue },
    options() {
      return Object.keys(precisions).map(key => ({
        value: precisions[key],
        text: this.$t(precisions[key]),
      }));
    },
  },
  props: {
    modelValue: Object,
  },
  components: {
    RadioGroup,
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "title": "Precision",
    "soft": "Regular",
    "exact": "Exact",
    "fuzzy": "Fuzzy"
  },
  "nl": {
    "title": "Nauwkeurigheid",
    "soft": "Normaal",
    "exact": "Precies",
    "fuzzy": "Fuzzy"
  }
}
</i18n>
