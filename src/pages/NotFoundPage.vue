<template>
  <div class="not-found-page">
    <h1>{{ $t('not_found_title') }}</h1>
    <p>{{ $t('not_found_message') }}</p>
    <router-link :to="{ name: 'home' }">{{ $t('go_to_home') }}</router-link>
  </div>
</template>
<script lang="ts" setup>
export interface NotFoundPageProps {}
// This page is displayed for any unknown routes (404 Not Found)
</script>
