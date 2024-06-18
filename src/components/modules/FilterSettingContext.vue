<template>
  <label>{{ $t('title') }}</label>
  <radio-group
    :modelValue="filter.context"
    :options="options"
    @update:modelValue="filter.context = $event"
    type="radio" />
</template>

<script>
import * as contexts from '@/models/Contexts';
import RadioGroup from '@/components/layout/RadioGroup.vue';

export default {
  computed: {
    filter() { return this.modelValue },
    options() {
      return Object.keys(contexts).map(key => ({
        value: contexts[key],
        text: this.$t(contexts[key]),
      }));
    },
  },
  props: {
    modelValue: Object
  },
  components: {
    RadioGroup,
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "title": "Context",
    "include": "Include",
    "exclude": "Exclude"
  },
  "nl": {
    "title": "Context",
    "include": "Inclusief",
    "exclude": "Exclusief"
  }
}
</i18n>
