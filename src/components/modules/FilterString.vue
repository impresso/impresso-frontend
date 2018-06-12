<template lang="html">
  <filter-wrapper v-bind:title="$t('query')" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <b-input type="text" v-model="filter.query" v-on:input="updateFilter" v-on:keyup.enter.native="submitFilter" />
    </div>
  </filter-wrapper>
</template>

<script>
import FilterWrapper from './FilterWrapper';

export default {
  data: () => ({
    options: [{
      value: 'include',
      text: 'Include',
    },
    {
      value: 'exclude',
      text: 'Exclude',
    }],
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
    },
    submitFilter() {
      this.$emit('submit');
    },
    remove() {
      this.$emit('remove');
    },
  },
  components: {
    FilterWrapper,
  },
};
</script>

<style lang="css">
</style>

<i18n>
{
  "en": {
    "query": "Text"
  },
  "fr": {
    "query": "Texte"
  },
  "nl": {
    "query": "Tekst"
  }
}
</i18n>
