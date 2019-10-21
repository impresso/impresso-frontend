<template lang="html">
  <div class="container my-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col col xl="9" lg="10" md="12">
        <h1 class="text-center mb-5">{{$t('title')}}</h1>
        <b-carousel
          class="recipe"
          style="text-shadow: 0px 0px 2px #000"
          v-bind:interval="0"
          indicators>
          <b-carousel-slide
            v-for="(recipe, i) in recipes"
            v-bind:key="i"
            v-bind:caption="recipe.caption"
            v-bind:text="recipe.text"
            v-bind:img-src="recipe.img_src">
            <a v-bind:href="recipe.query" class="btn btn-secondary" v-if="recipe.query">Perform this query ... </a>
            <a v-bind:href="recipe.video" target="_blank" class="btn btn-primary">Watch the video</a>
          </b-carousel-slide>
        </b-carousel>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import content from '@/assets/homepage.json';

export default {
  data: () => ({
    recipes: content.recipes,
  }),
};
</script>

<style lang="scss">
  .recipe {
    .carousel-caption h3{
      color: white;
      font-weight: bold;
    }

    .carousel-caption{
      background: rgba(0,0,0, 0.6);
      left:0;
      right:0;
      bottom:0;
      padding: 20px 20px 50px;
    }
  }

</style>

<i18n>
{
  "en": {
    "title": "Examples"
  },
  "nl": {
    "title": "Voorbeelden"
  }
}
</i18n>
