<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right p-2">
      <div slot="header">
        <autocomplete v-on:submit="submit" />
      </div>
      <div class="p-4">
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
      {{submitted}}
      <div :style="{ width: '400px' }">
        <entities-suggestions-list :entities="testEntities"/>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import EntitiesSuggestionsList from '@/components/modules/EntitiesSuggestionsList'

export default {
  data: () => ({
    submitted: false,
    testEntities: [{
      uid: 'moo',
      name: 'Barack Obama',
      type: 'person'
    }]
  }),
  methods: {
    submit(suggestion) {
      this.submitted = suggestion;
    },
  },
  components: {
    Autocomplete,
    EntitiesSuggestionsList,
  },
};
</script>
