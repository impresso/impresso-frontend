<template>
  <div class="recipes">
    <div v-for="(recipe, i) in recipes" v-bind:key="i">
      <div class="container mb-5 ">
        <b-row v-if="recipe.img_src" class="recipe  mb-4 d-flex flex-wrap align-items-center">
          <b-col class="text-col p-3 my-5">
            <h3 :class="{ 'text-white': darkMode }">
              <i>{{ recipe.caption }}</i>
            </h3>
            <p>{{ recipe.text }}</p>
            <a
              v-bind:href="recipe.query"
              class="btn border-primary text-dark bg-light small-caps mr-1"
              v-if="recipe.query"
              >{{ $t('perform_query') }}</a
            >
            <a
              v-bind:href="recipe.video"
              target="_blank"
              class="btn btn-secondary text-light small-caps"
              >{{ $t('watch_video') }}</a
            >
          </b-col>

          <b-col>
            <div class="image-col">
              <a v-bind:href="recipe.video" target="_blank">
                <img v-bind:src="recipe.img_src" class="img-fluid" :title="recipe.query" />
              </a>
            </div>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import content from '@/assets/homepage.json'

export default {
  props: {
    darkMode: Boolean,
  },
  data: () => ({
    recipes: content.recipes,
  }),
}
</script>

<style lang="scss"></style>

<i18n lang="json">
{
  "en": {
    "perform_query": "Perform this query",
    "watch_video": "Watch the video"
  }
}
</i18n>
