<template lang="html">
  <filter-wrapper v-bind:id="filter.key" v-bind:title="filter.query" icon="rocket" v-on:remove="remove">
    <b-input type="text" :modelValue="filter.query" v-on:input="updateFilter" v-on:keyup.enter="submitFilter"
      v-bind:disabled="disabled" size="sm" />
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

import FilterWrapper from '@/components/modules/FilterWrapper.vue'

export default {
  data: () => ({
    disabled: true,
  }),
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

<i18n lang="json">{
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
}</i18n>
