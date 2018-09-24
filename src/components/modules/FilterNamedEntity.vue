<template lang="html">
  <filter-wrapper v-bind:title="$t(`label.${filter.entity.getLabel(1)}`)" v-on:remove="remove">
    <div slot="context">
      <i-dropdown
      v-model="filter.context"
      v-bind:options="options"
      v-on:input="submitFilter"
      variant="outline-primary"
      size="sm" />
    </div>
      <b-badge variant="secondary">
        <span v-if="filter.entity.hasLabel('person')" class="dripicons-user"></span>
        <span v-if="filter.entity.hasLabel('location')" class="dripicons-location"></span>
        {{filter.entity.name}}
    </b-badge>
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

<style scoped lang="css">
.badge {
  margin-top:2px;
  padding: 0.38em 0.5em;
}
</style>

<i18n>
{
  "en": {
    "label": {
      "person": "Person",
      "location": "Location"
    }
  },
  "fr": {
    "label": {
      "person": "Personne",
      "location": "Lieu"
    }
  },
  "de": {
    "label": {
      "person": "Person",
      "location": "Ort"
    }
  },
  "nl": {
    "label": {
      "person": "Persoon",
      "location": "Locatie"
    }
  }
}
</i18n>
