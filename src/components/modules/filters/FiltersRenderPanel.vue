<template>
  <div class="filters-render-panel">
    <div class="code-container border shadow-sm rounded-md" :class="{ 'has-error': error }">
      <pre class="rounded-md"><code ref="codeRef" class="json">{{ displayedContent }}</code></pre>
      <button
        @click="copyToClipboard"
        class="btn btn-sm btn-icon mx-2 position-absolute top-0 right-0"
        aria-label="Copy to clipboard"
        title="Copy to clipboard"
      >
        <Icon name="copy" />
      </button>
    </div>
    <div v-if="error" class="error-message mt-2 text-danger">
      {{ error }}
    </div>
    <div v-if="isCopied" class="copy-success mt-2 text-success">
      {{ $t('copied_to_clipboard') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import hljs from 'highlight.js'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github.css'
import { deserializeFilters } from '@/logic/filters'
import type { Filter } from 'impresso-jscommons'
import Icon from '@/components/base/Icon.vue'

const DefaultFilters: Filter[] = []

interface Props {
  modelValue: string // base64 encoded filters
}

const emit = defineEmits<{
  parsedFilters: [value: Filter[]]
}>()

const props = defineProps<Props>()

const codeRef = ref<HTMLElement | null>(null)
const displayedContent = ref<string>(JSON.stringify(DefaultFilters))
const error = ref<string | null>(null)
const isCopied = ref(false)
const resetTimeout = ref<number | null>(null)

// Process filters when they change
watch(() => props.modelValue, processFilters, { immediate: true })

function processFilters(base64String: string) {
  if (!base64String) {
    displayedContent.value = JSON.stringify(DefaultFilters)
    error.value = null
    emit('parsedFilters', DefaultFilters)
    return
  }

  try {
    // Use the deserializeFilters function from filters.js
    const filters = deserializeFilters(base64String) as Filter[]
    displayedContent.value = JSON.stringify(filters, null, 2)
    error.value = null
    emit('parsedFilters', filters)
  } catch (err) {
    console.error('Error deserializing filters:', err)
    displayedContent.value = JSON.stringify(DefaultFilters)
    error.value = 'Malformed filters: Unable to deserialize the provided data.'
    emit('parsedFilters', DefaultFilters)
  }
}

// Apply syntax highlighting when content changes
watch(displayedContent, () => {
  if (codeRef.value) {
    setTimeout(() => {
      // Remove previous highlighting
      delete codeRef.value.dataset.highlighted
      hljs.highlightElement(codeRef.value)
    }, 0)
  }
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(displayedContent.value)
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

onMounted(() => {
  // Register JSON language for highlight.js
  hljs.registerLanguage('json', json)

  // Initial highlighting
  if (codeRef.value) {
    hljs.highlightElement(codeRef.value)
  }
})

// Clean up timeout when component is unmounted
onUnmounted(() => {
  if (resetTimeout.value) {
    window.clearTimeout(resetTimeout.value)
  }
})
</script>

<style scoped lang="scss">
.filters-render-panel {
  position: relative;
  margin-bottom: 1rem;

  .code-container {
    position: relative;
    overflow-x: auto;
    border: 1px solid var(--bs-border-color);

    &.has-error {
      border-color: var(--bs-danger);
    }

    pre {
      margin: 0;
      padding: 1rem;
      white-space: pre-wrap;
      font-family: var(--bs-font-monospace);
      font-size: 0.875rem;
      tab-size: 2;
    }

    code {
      border-radius: var(--impresso-border-radius-sm, 0.25rem);
      border: 1px solid transparent;
      padding: 0;
      background: transparent;
    }
  }

  .error-message {
    font-size: 0.875rem;
  }

  .copy-success {
    font-size: 0.875rem;
  }

  .btn-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "copied_to_clipboard": "Copied to clipboard!"
  },
  "fr": {
    "copied_to_clipboard": "Copié dans le presse-papiers !"
  },
  "de": {
    "copied_to_clipboard": "In die Zwischenablage kopiert!"
  }
}
</i18n>
