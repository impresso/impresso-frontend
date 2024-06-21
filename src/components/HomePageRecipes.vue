<template lang="html">
  <div class="container-fluid mb-5">
    <b-row class="justify-content-md-center mb-5">
      <b-col class="m-0 p-0">
        <bb-carousel
          class="recipe"
          :interval="6000"
          indicators>
          <bb-carousel-slide
            v-for="(recipe, i) in recipes"
            v-bind:key="i"
            v-bind:caption="recipe.caption"
            v-bind:text="recipe.text"
            v-bind:img-src="recipe.img_src">
            <a v-bind:href="recipe.query" class="btn btn-outline-primary bg-light" v-if="recipe.query">Perform this query ... </a>
            <a v-bind:href="recipe.video" target="_blank" class="btn btn-primary">Watch the video</a>
          </bb-carousel-slide>
        </bb-carousel>
      </b-col>
    </b-row>
  </div>
</template>

<script>
/** @deprecated See HomePage2020 */

import content from '@/assets/homepage.json';

export default {
  data: () => ({
    recipes: content.recipes,
  }),
};
</script>

<style lang="scss">
  @import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';
  .recipe {
    .carousel-caption h3{
      color: white;
      font-weight: bold;
    }

    .carousel-caption{
      left:0;
      right:0;
      top:0;
      padding: 80px 20px 50px;
    }
    .carousel-caption h3 {
      color: black;
      font-weight: bold;
      background: $clr-accent;
      display: inline-block;
      padding: 10px 20px;
      text-shadow: none;
    }
    .carousel-item::before{
      width: 100%;
      height: 100%;
      content: '';

      background: rgba(50,50,50,0.8) url(./../assets/img/black-dots.png) repeat;
      position: absolute;
      left: 0;
      top: 0;
    }
    .carousel-indicators {
      bottom: auto;
      top: 1em;
    }
  }

</style>

<i18n lang="json">
{
  "en": {
    "title": "Examples"
  },
  "nl": {
    "title": "Voorbeelden"
  }
}
</i18n>
