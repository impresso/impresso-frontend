<template lang="html">
  <filter-wrapper v-bind:title="$t(`label.${filter.entity.getLabel(1)}`)" v-on:remove="remove">
    <div slot="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="p-2">
      <icon v-if="filter.entity.hasLabel('person')" name="user-circle"></icon>
      <icon v-if="filter.entity.hasLabel('location')" name="map-marker"></icon>
      <icon v-if="filter.entity.hasLabel('test')" name="flash"></icon>
      {{filter.entity.name}}
    </div>
  </filter-wrapper>
</template>

<script>
import Filter from '@/models/Filter';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';
import 'vue-awesome/icons/flash';

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
  props: ['value'],
  computed: {
    filter: {
      get() {
        return new Filter(this.value);
      },
    },
  },
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
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
      "location": "Location",
      "test": "Daniel and Paul sitting in a tree, Jay Es Sea Ar Eye Pee Tee"
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
