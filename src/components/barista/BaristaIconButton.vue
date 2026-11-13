<template>
  <button
    type="button"
    class="btn btn-sm BaristaIconButton"
    :title="props.label"
    :aria-label="props.label"
    :disabled="props.disabled"
  >
    <Icon :name="props.icon" :scale="0.7" :stroke-width="props.strokeWidth" />
  </button>
</template>

<script setup lang="ts">
import Icon from '@/components/base/Icon.vue'

export interface BaristaIconButtonProps {
  icon: string
  label: string
  disabled?: boolean
  strokeWidth?: number
}

const props = withDefaults(defineProps<BaristaIconButtonProps>(), {
  disabled: false,
  strokeWidth: 1.75
})
</script>

<style>
.btn.BaristaIconButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  background-color: transparent;
  box-shadow: none;
  color: var(--impresso-color-black);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.1s ease;
}
.btn.BaristaIconButton:hover:not(:disabled) {
  border-color: var(--clr-grey-600);
  background-color: var(--impresso-color-white);
}
.btn.BaristaIconButton:active:not(:disabled) {
  transform: translateY(1px);
}
@media (prefers-reduced-motion: reduce) {
  .btn.BaristaIconButton {
    transition: none;
  }
}
.btn.BaristaIconButton:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 1px;
}
.btn.BaristaIconButton:disabled {
  opacity: 0.35;
}
</style>
