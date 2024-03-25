<template>
  <div class="Recipe shadow">
    <h3>{{ caption }}</h3>

    <p>{{ text }}</p>

    <a v-if="!query || showVideo" v-bind:href="video" target="_blank" class="Recipe__videoWrapper">
      <div class="position-absolute">
        <img v-bind:src="img_src" alt="video previe" class="img-fluid rounded" />
        <div class="Recipe__videoBackground "></div>
        <icon
          name="play"
          scale="5"
          class="position-absolute"
          style="top:50%; left:50%;margin-left: -40px; margin-top: -30px"
        />
      </div>
    </a>
    <a
      v-bind:href="query"
      class="btn btn-md btn-primary border-0 btn-block text-dark bg-light mt-3"
      v-if="query"
      >{{ $t('perform_query') }}</a
    >
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'

Icon.register({
  play: {
    width: 24,
    height: 24,
    paths: [
      {
        style: 'fill:white; stroke:black; stroke-width:1px;',
        d:
          'M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z',
      },
    ],
  },
})
export default {
  name: 'Recipe',
  components: {
    Icon,
  },
  props: {
    darkMode: Boolean,
    caption: String,
    text: String,
    video: String,
    img_src: String,
    query: String,
    showVideo: Boolean,
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
  color: var(--clr-grey-800);
  font-family: var(--bs-font-sans-serif);
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

<i18n>
{
  "en": {
    "perform_query": "Perform this query",
    "watch_video": "Watch the video"
  }
}
</i18n>
