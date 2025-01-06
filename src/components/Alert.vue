<template>
  <div :class="`Alert ${type}`">
    <Icon :name="'info'" class="mr-2" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import Icon from './base/Icon.vue'

interface AlertProps {
  value?: string
  type?: 'info' | 'warning' | 'error'
}

defineProps<AlertProps>()
</script>

<style>
.Alert {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background-color: rgba(var(--secondary-rgb), 0.2);
  border-radius: var(--impresso-border-radius-sm);
}

.Alert svg {
  flex-shrink: 0;
}

.Alert svg path {
  stroke: var(--secondary);
}

.Alert.error {
  background-color: rgba(var(--error-rgb), 0.2);
}
.Alert.error svg path,
.Alert.warning svg path {
  stroke: var(--impresso-color-black);
}
.Alert.warning {
  background-color: rgba(var(--warning-rgb), 0.2);
}
</style>
