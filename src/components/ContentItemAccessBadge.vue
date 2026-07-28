<template>
  <div
    class="access-badge d-inline-flex align-items-center gap-1"
    :class="granted ? 'access-badge--granted' : 'access-badge--denied'"
  >
    <span class="access-badge__dot" aria-hidden="true"></span>
    <span class="very-small">{{ label }}</span>
    <InfoButton style="margin-top: -2px" :default-content="description" :name="label" />
  </div>
</template>

<script setup lang="ts">
import InfoButton from './base/InfoButton.vue'

export interface ContentItemAccessBadgeProps {
  /** Display label for this access dimension, e.g. "Web App", "Transcript", "Facsimile" */
  label: string
  /** Tooltip content explaining what the current granted/denied state means */
  description: string
  /** Whether the user currently has access to this dimension */
  granted: boolean
}

defineProps<ContentItemAccessBadgeProps>()
</script>

<style scoped>
.access-badge {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--bs-border-color, #dee2e6);
  line-height: 1;
}

.access-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.access-badge--granted .access-badge__dot {
  background-color: var(--bs-success, #198754);
}

.access-badge--denied .access-badge__dot {
  background-color: var(--bs-secondary, #adb5bd);
}
</style>
