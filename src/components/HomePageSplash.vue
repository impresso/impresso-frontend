<template>
<div id="HomePageSplash">
  <b-container>
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="6" lg="8" md="10">
        <div class="mb-5">
          <h1 v-html="content.splash.title" />
          <h3 v-html="content.splash.subtitle" />
        </div>
        <autocomplete
        v-bind:variant="'warning'"
        v-on:submit="onSuggestion" />
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import autocomplete from '@/components/Autocomplete';
import content from '@/assets/homepage.json';

export default {
  data: () => ({
    content,
  }),
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
  background-image: url('./../assets/img/newspapers_bg_dark_blue.jpg');
  padding: 100px 0;
  h1, h3{
    color: white;
  }
}
</style>
