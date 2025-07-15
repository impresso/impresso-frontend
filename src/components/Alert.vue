<template>
  <div class="Alert" :class="type">
    <Icon :strokeWidth="1.5" :name="iconType" class="mr-2" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './base/Icon.vue'

export interface AlertProps {
  value?: string
  type?: 'info' | 'warning' | 'error' | 'success'
}

const PropsTypeToIconType: Record<AlertProps['type'], string> = {
  info: 'info',
  warning: 'warningTriangle',
  error: 'warningTriangle',
  success: 'check'
}

const props = withDefaults(defineProps<AlertProps>(), {
  type: 'info'
})

const iconType = computed(() => {
  return PropsTypeToIconType[props.type]
})
</script>

<style>
.Alert {
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  background-color: rgba(var(--secondary-rgb), 0.2);
  border-radius: var(--impresso-border-radius-sm);
}

.Alert svg {
  flex-shrink: 0;
}

.Alert svg path {
  stroke: var(--secondary);
}

.Alert.info {
  background-color: rgba(var(--info-rgb), 0.6);
}
.Alert.error {
  background-color: rgba(var(--error-rgb), 0.2);
}
.Alert.error svg path,
.Alert.warning svg path {
  stroke: var(--impresso-color-black);
}
.Alert.success svg path {
  fill: none;
  stroke: green;
}
.Alert.success {
  background-color: rgba(var(--success-rgb), 0.2);
}
.Alert.warning {
  background-color: rgba(var(--warning-rgb), 0.2);
}
</style>
