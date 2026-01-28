<template>
  <div id="InstitutionsAccess">
    <Header />
    <main class="mx-lg-5 mx-md-2" style="margin-top: 100px">
      <router-view />
    </main>
  </div>
</template>
<script setup lang="ts">
import Header from './components/Header.vue'
</script>

<style></style>
