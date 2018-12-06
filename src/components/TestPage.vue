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

    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';

export default {
  data: () => ({
  }),
  methods: {
    submit(suggestion) {
      console.log(suggestion);
    },
  },
  components: {
    Autocomplete,
  },
};
</script>
