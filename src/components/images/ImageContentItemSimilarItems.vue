<template>
  <div class="ImageContentItemSimilarItems">
    <!-- TODO: implement "similar items" content for images -->
  </div>
</template>

<script setup lang="ts">
import { IImage } from '@/models'

defineProps<{
  image?: IImage | null
}>()
</script>
