<template lang="html">
  <div class="container mb-5">
    <b-row
      v-for="(recipe, i) in recipes"
      v-if="recipe.img_src"
      v-bind:key="i"
      class="recipe justify-content-md-center mb-4">
      <b-col class="image-col">
        <a v-bind:href="recipe.video" target="_blank">
          <img v-bind:src="recipe.img_src" class="img-fluid" :title="recipe.query">
        </a>
      </b-col>
      <b-col class="text-col p-3">
        <h3 class="text-white">{{recipe.caption}}</h3>
        <p>{{recipe.text}}</p>
        <a v-bind:href="recipe.query" class="btn border-primary text-dark bg-light small-caps mr-1" v-if="recipe.query">{{$t('perform_query')}}</a>
        <a v-bind:href="recipe.video" target="_blank" class="btn btn-secondary text-light small-caps">{{$t('watch_video')}}</a>
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
  @import "impresso-theme/src/scss/variables.sass";

  .recipe:nth-child(odd) {
    background-color: $clr-primary;
  }
  .recipe:nth-child(even) {
    // background-color: $clr-secondary;
    overflow: hidden;
    .image-col {
      left: 50%;
    }
    .text-col {
      left: -50%;
    }
  }

</style>

<i18n>
{
  "en": {
    "perform_query": "Perform this query",
    "watch_video": "Watch the video"
  }
}
</i18n>
