<template>
  <div id="InstitutionsAccess">
    <a class="InstitutionsAccessSkipLink" href="#main-content">Skip to content</a>
    <Header />
    <main id="main-content" class="InstitutionsAccess__main mx-lg-4 mx-2" tabindex="-1">
      <router-view />
    </main>
    <Toaster />
  </div>
</template>
<script setup lang="ts">
import Toaster from '@/components/base/Toaster.vue'
import Header from './components/Header.vue'
</script>

<style>
.InstitutionsAccess__main {
  padding-top: calc(var(--institutions-header-height) + 1.5rem);
}
</style>
