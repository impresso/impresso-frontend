<template>
  <div class="TutorialMonitor">Hello! {{ title }}</div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  /** @type {string} */
  title: {
    type: String,
    required: true
  }
})
</script>
