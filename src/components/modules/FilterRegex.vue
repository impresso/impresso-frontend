<template lang="html">
  <filter-wrapper
    v-bind:id="filter.key"
    v-bind:title="filter.query"
    icon="rocket"
    v-on:remove="remove"
  >
    <b-input
      type="text"
      v-model="filter.query"
      v-on:input.native="updateFilter"
      v-on:keyup.enter.native="submitFilter"
      v-bind:disabled="disabled"
      size="sm"
    />
    <template v-slot:settings>
      <p><em>ToDo:</em> RegEx filter Settings</p>
    </template>
  </filter-wrapper>
</template>

<script>
/**
 * @deprecated Not used anywhere.
 */

import FilterFactory from '@/models/FilterFactory'

import FilterWrapper from './FilterWrapper'

export default {
  data: () => ({
    disabled: true,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', FilterFactory.create(this.filter))
    },
    submitFilter() {
      this.$emit('submit')
      this.disabled = true
    },
    remove() {
      this.$emit('remove')
    },
    editFilter() {
      this.disabled = false
    },
  },
  components: {
    FilterWrapper,
  },
}
</script>

<i18n lang="json">
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
