<template>
  <div class="copy-to-datalab-panel">
    <div class="code-container">
      <pre><code class="python">{{ code }}</code></pre>
    </div>
    <button
      class="copy-button btn btn-sm btn-primary"
      @click="copyToClipboard"
      :disabled="isCopied"
    >
      <span v-if="!isCopied">{{ $t('copy_code') }}</span>
      <span v-else>{{ $t('copied') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onUnmounted } from 'vue'

interface Props {
  code: string
}

const props = defineProps<Props>()
const isCopied = ref(false)
const resetTimeout = ref<number | null>(null)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true

    // Reset the copied state after 2 seconds
    if (resetTimeout.value) {
      window.clearTimeout(resetTimeout.value)
    }

    resetTimeout.value = window.setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

// Clean up timeout when component is unmounted
onUnmounted(() => {
  if (resetTimeout.value) {
    window.clearTimeout(resetTimeout.value)
  }
})
</script>

<style scoped lang="scss">
.copy-to-datalab-panel {
  position: relative;
  margin-bottom: 1rem;

  .code-container {
    position: relative;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    overflow-x: auto;

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: var(--bs-font-monospace);
      font-size: 0.875rem;
    }
  }

  .copy-button {
    float: right;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "copy_code": "Copy code",
    "copied": "Copied!"
  },
  "fr": {
    "copy_code": "Copier le code",
    "copied": "Copié!"
  },
  "de": {
    "copy_code": "Code kopieren",
    "copied": "Kopiert!"
  }
}
</i18n>
