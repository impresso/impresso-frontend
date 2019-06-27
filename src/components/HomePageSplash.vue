<template>
<div class="py-5" id="HomePageSplash">
  <b-container>
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <div class="mb-5">
          <h1>Media Monitoring of the Past</h1>
          <h3>Search trough 200 years of newspapers</h3>
        </div>
        <autocomplete v-on:submit="onSuggestion" />
      </b-col>
    </b-row>
  </b-container>

</div>
</template>

<script>
import autocomplete from '@/components/Autocomplete';

export default {
  data: () => ({}),
  methods: {
    onSuggestion(suggestion) {
      this.$store.commit('search/CLEAR');
      this.$store.commit('search/ADD_FILTER', suggestion);
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
    },
  },
  components: {
    autocomplete,
  },
};
</script>

<style scoped lang="scss">
#HomePageSplash{
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: url('./../assets/img/newspapers_bg_light.jpg');
}
</style>
