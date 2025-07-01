<template>
  <div class="Recipe shadow">
    <h3>{{ caption }}</h3>

    <p>{{ text }}</p>

    <a v-if="!query || showVideo" v-bind:href="video" target="_blank" class="Recipe__videoWrapper">
      <div class="position-absolute">
        <img v-bind:src="img_src" alt="video previe" class="img-fluid rounded" />
        <div class="Recipe__videoBackground"></div>
        <icon
          name="play"
          scale="3"
          class="position-absolute"
          style="top: 50%; left: 50%; margin-left: -40px; margin-top: -30px"
        />
      </div>
    </a>
    <a
      v-bind:href="query"
      class="btn btn-md btn-outline-primary border btn-block mt-3"
      v-if="query"
      >{{ $t('perform_query') }}</a
    >
  </div>
</template>

<script>
import Icon from '@/components/base/Icon.vue'

export default {
  name: 'Recipe',
  components: {
    Icon
  },
  props: {
    darkMode: Boolean,
    caption: String,
    text: String,
    video: String,
    img_src: String,
    query: String,
    showVideo: Boolean
  },

  data: () => ({})
}
</script>

<style lang="css">
.Recipe {
  background: var(--clr-grey-100-rgba-20);
  border-radius: var(--impresso-border-radius-md);
}

.Recipe:hover h3 {
  color: var(--clr-white);
}
.Recipe h3 {
  color: var(--clr-grey-800);
  font-family: var(--bs-font-sans-serif);
  font-size: var(--impresso-font-size-4);
}

.Recipe__videoWrapper {
  padding-top: 47%;
  height: 0;
  position: relative;
  overflow: hidden;
  display: block;
  border-radius: var(--impresso-border-radius-md);
}
.Recipe__videoWrapper > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--impresso-border-radius-md);
}
.Recipe__videoWrapper img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--impresso-border-radius-md);
  object-fit: cover;
}

.Recipe__videoBackground {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1;
  border-radius: var(--impresso-border-radius-md);
}
</style>

<i18n lang="json">
{
  "en": {
    "perform_query": "Perform this query",
    "watch_video": "Watch the video"
  }
}
</i18n>
