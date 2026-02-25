<template>
  <div id="InstitutionsAccess">
    <Header />
    <main class="mx-lg-4 mx-2" style="padding-top: 100px">
      <router-view />
    </main>
    <Toaster />
  </div>
</template>
<script setup lang="ts">
import Toaster from '@/components/base/Toaster.vue'
import Header from './components/Header.vue'
</script>

<style></style>
