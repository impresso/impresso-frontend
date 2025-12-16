<template>
  <div class="NotFoundPage">
    <h1>{{ $t('not_found_title') }}</h1>
    <p>{{ $t('not_found_message') }}</p>
    <router-link :to="{ name: 'home' }">{{ $t('go_to_home') }}</router-link>
  </div>
</template>
<script lang="ts" setup>
export interface NotFoundPageProps {}
// This page is displayed for any unknown routes (404 Not Found)
</script>
<i18n>
  {
    "en": {
      "not_found_title": "Page Not Found",
      "not_found_message": "The page you are looking for does not exist or has been moved.",
      "go_to_home": "Go to Home Page"
    },
  }
</i18n>
<style>
.NotFoundPage {
  --impresso-text-decoration-color: var(--clr-grey-300);
  --impresso-text-decoration-color-hover: var(--impresso-color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--impresso-color-white);
  text-align: center;

  background: -webkit-linear-gradient(
    360deg,
    var(--impresso-color-black-deeper),
    var(--impresso-color-black)
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    360deg,
    var(--impresso-color-black-deeper),
    var(--impresso-color-black)
  );
}
.NotFoundPage h1 {
  color: var(--impresso-color-white);
}

.NotFoundPage a {
  color: var(--impresso-color-white);
  text-decoration: underline;
  text-decoration-color: var(--impresso-text-decoration-color);
  text-underline-offset: var(--impresso-text-underline-offset);
}
.NotFoundPage a:hover {
  text-decoration-color: var(--impresso-text-decoration-color-hover);
}
</style>
