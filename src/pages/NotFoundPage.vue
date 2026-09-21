<template>
  <div class="NotFoundPage static-page">
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
