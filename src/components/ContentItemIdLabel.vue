<template>
  <div
    class="ContentItemIdLabel border px-2 small text-muted d-inline-block position-relative"
    :class="{ 'is-copied': copied }"
    role="button"
    tabindex="0"
    :title="copied ? $t('copied') : $t('copyToClipboard')"
    :aria-label="copied ? $t('copied') : $t('copyToClipboard')"
    @click="copyToClipboard"
    @keydown.enter.prevent="copyToClipboard"
    @keydown.space.prevent="copyToClipboard"
  >
    <span class="id-text">{{ props.id }}</span>
    <Transition name="copied-badge">
      <span v-if="copied" class="copied-badge">{{ $t('copied') }}</span>
    </Transition>
    <InfoButton
      style="margin-top: -2px"
      :default-content="$t('id_description')"
      :name="$t('id_text')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import InfoButton from './base/InfoButton.vue'

export interface ContentItemIdLabelProps {
  id: string
}

const props = defineProps<ContentItemIdLabelProps>()

const copied = ref(false)
let resetTimeout: ReturnType<typeof setTimeout> | undefined

const copyToClipboard = async () => {
  if (!props.id || copied.value) return

  try {
    await navigator.clipboard.writeText(props.id)
    copied.value = true
    if (resetTimeout) clearTimeout(resetTimeout)
    resetTimeout = setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch (error) {
    console.warn('Failed to copy id to clipboard:', error)
  }
}
</script>

<style scoped>
.ContentItemIdLabel {
  cursor: pointer;
  user-select: none;
  border-radius: 9999px;
  transition: border-color 0.2s ease;
}

.ContentItemIdLabel:hover {
  border-color: #6c757d;
  color: #495057;
}

.ContentItemIdLabel.is-copied {
  border-color: #198754;
}

.copied-badge {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  background-color: #198754;
  color: #fff;
  font-weight: 600;
  line-height: 1.2;
  z-index: 1;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(25, 135, 84, 0.25);
}

.copied-badge-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.25);
}

.copied-badge-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s ease;
}

.copied-badge-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(6px) scale(0.92);
}

.copied-badge-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px) scale(0.96);
}
</style>

<i18n lang="json">
{
  "en": {
    "id_text": "ID",
    "id_description": "This is a unique identifier in the Impresso system. Click the badge to copy it to your clipboard.",
    "copyToClipboard": "Copy ID to clipboard",
    "copied": "Copied!"
  }
}
</i18n>
