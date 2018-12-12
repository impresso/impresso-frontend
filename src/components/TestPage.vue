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
    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';

export default {
  data: () => ({
    submitted: false,
  }),
  methods: {
    submit(suggestion) {
      this.submitted = suggestion;
    },
  },
  components: {
    Autocomplete,
  },
};
</script>
