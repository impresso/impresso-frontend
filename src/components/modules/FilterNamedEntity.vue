<template lang="html">
  <filter-wrapper v-bind:title="$t(`label.${filter.label}`)" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <icon v-if="filter.label === 'person'" name="user-circle"></icon>
      <icon v-if="filter.label === 'location'" name="map-marker"></icon>
      {{filter.title}}
    </div>
  </filter-wrapper>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';

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
    getLabel(label) {
      return this.$t(`label.${label}`);
    },
    remove() {
      this.$emit('remove');
    },
  },
  components: {
    Icon,
    FilterWrapper,
  },
};
</script>

<style scoped lang="less">
  .filter{
    .body{
      padding: 5px 10px;
      .fa-icon{
        width: 12px;
        margin-bottom: -2px;
      }
    }
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
      "location": "Localisation"
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
