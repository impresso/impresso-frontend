<template>
  <div class="Recipe shadow">
    <h3>{{ caption }}</h3>

    <p>{{ text }}</p>

    <a
      v-bind:href="query"
      class="btn border-primary text-dark bg-light small-caps mr-1"
      v-if="query"
      >{{ $t('perform_query') }}</a
    >
    <a v-bind:href="video" target="_blank" class="btn btn-secondary text-light small-caps">{{
      $t('watch_video')
    }}</a>

    <a v-bind:href="video" target="_blank">
      <img v-bind:src="img_src" alt="video previe" class="img-fluid" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'Recipe',
  props: {
    darkMode: Boolean,
    caption: String,
    text: String,
    video: String,
    img_src: String,
    query: String,
  },
  data: () => ({}),
}
</script>

<style lang="css">
.Recipe {
  background: #e9fff71f;
  border-radius: var(--impresso-border-radius-md);
  max-width: 480px;
}
.Recipe:hover {
  background-color: #e9fff73b;
}
.Recipe:hover h3 {
  color: var(--clr-white);
}
.Recipe h3 {
  color: #ffffff9e;
  font-family: var(--bs-font-sans-serif);
  font-variant: small-caps;
  text-transform: lowercase;
  text-align: start;
  font-size: inherit;
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
