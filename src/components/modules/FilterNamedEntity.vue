<template lang="html">
  <filter-wrapper v-on:remove="remove">
    <div slot="settings">
      <filter-setting-context v-model="filter" />
    </div>
    <div class="p-2">
      <icon v-if="filter.item.hasLabel('person')" name="user-circle"></icon>
      <icon v-if="filter.item.hasLabel('location')" name="map-marker"></icon>
      {{filter.item.name}}
    </div>
  </filter-wrapper>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';

import FilterSettingContext from './FilterSettingContext';
import FilterWrapper from './FilterWrapper';

export default {
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
    Icon,
    FilterSettingContext,
    FilterWrapper,
  },
};
</script>

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
