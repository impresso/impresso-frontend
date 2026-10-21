<template>
  <div class="ImageContentItemCiteAs">
    <!-- TODO: implement "cite as" content for images -->
  </div>
</template>

<script setup lang="ts">
import { IImage } from '@/models'

defineProps<{
  image?: IImage | null
}>()
</script>
