<template>
  <section class="PageHeading border-tertiary">
    <span class="label small-caps">{{ label }}</span>
    <h3>{{ title }}</h3>
    <slot></slot>
  </section>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  label: string
  title: string
}>()
</script>
