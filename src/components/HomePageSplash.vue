<template>
<div id="HomePageSplash">
  <b-container>
    <b-row class="justify-content-md-center pt-5 pb-3">
      <b-col col xl="6" lg="8" md="10">
        <div class="mb-5">
          <h1 v-html="content.splash.title" />
          <h3 v-html="content.splash.subtitle" />
        </div>
        <autocomplete
          v-bind:variant="'warning'"
          v-on:submit="onSuggestion" />
        <div v-html="content.splash.text_bottom" class="mt-3 text_bottom" />
        <h2 class="text-center pt-5 m-0 small-caps text-white">A couple of Case Studies to get you  started ...</h2>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import autocomplete from '@/components/Autocomplete.vue';
import content from '@/assets/homepage.json';

export default {
  data: () => ({
    content,
  }),
  methods: {
    onSuggestion(suggestion) {
      throw new Error(`This handler needs to be updated to add filters to current search query: ${suggestion}`)
    },
  },
  components: {
    autocomplete,
  },
};
</script>

<style scoped lang="scss">
#HomePageSplash{
  background: url('./../assets/img/black-dots.png') repeat,
    url('./../assets/img/newspapers_bg_dark_blue.jpg') center center/cover no-repeat;
  h1, h3{
    color: white;
  }


}
</style>
