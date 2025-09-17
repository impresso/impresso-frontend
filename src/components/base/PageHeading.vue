<template>
  <section class="PageHeading border-tertiary">
    <span class="label small-caps">{{ label }}</span>
    <h3>{{ title }}</h3>
    <slot></slot>
  </section>
</template>
<script setup lang="ts">
/**
 * @deprecated This component is deprecated and will be removed in future releases.
 */
defineProps<{
  label: string
  title: string
}>()
</script>
