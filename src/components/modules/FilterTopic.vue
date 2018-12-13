<template lang="html">
  <filter-wrapper v-on:remove="remove">
    <div slot="settings">
      <filter-setting-context v-model="filter" />
    </div>
    <span v-html="filter.h" />
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

<i18n>
{
  "en": {
    "query": "Regex",
    "edit": "Edit",
    "save": "Save"
  },
  "fr": {
    "query": "Regex"
  },
  "nl": {
    "query": "Regex",
    "edit": "Bewerken",
    "save": "Opslaan"
  }
}
</i18n>
