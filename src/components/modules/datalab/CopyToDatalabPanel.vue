<template>
  <div class="copy-to-datalab-panel">
    <div
      class="code-container border shadow-sm rounded-md"
      :class="{ isFocused }"
      @mouseup="onMouseUp"
    >
      <pre class="rounded-md"><code ref="codeRef" class="python">{{ code }}</code></pre>
      <button
        @click="copyToClipboard"
        class="btn btn-sm btn-icon mx-2 position-absolute top-0 right-0"
      >
        <Icon name="copy" />
      </button>
    </div>
    <slot name="description"></slot>
    <div class="buttons">
      <slot name="extra-buttons"></slot>
      <button
        class="copy-button btn btn-sm btn-primary"
        @click="copyToClipboard"
        :disabled="isCopied"
      >
        <span v-if="!isCopied">{{ $t('copy_code') }}</span>
        <span v-else>{{ $t('copied') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js'
import python from 'highlight.js/lib/languages/python'
import 'highlight.js/styles/color-brewer.css'
import { defineProps, onBeforeMount, onUnmounted, ref, watchEffect } from 'vue'
import Icon from '@/components/base/Icon.vue'

interface Props {
  code: string
}

const props = defineProps<Props>()
const emit = defineEmits(['copy'])
const isCopied = ref(false)
const isFocused = ref(false)
const resetTimeout = ref<number | null>(null)
const codeRef = ref<HTMLElement | null>(null)

const onMouseUp = () => {
  const selection = window.getSelection()
  if (!isFocused.value && selection.toString().length > 0) {
    isFocused.value = true
    return
  }
  selection.removeAllRanges()
  if (isFocused.value) {
    isFocused.value = false
    return
  }
  // select all text
  const range = document.createRange()
  range.selectNodeContents(codeRef.value)
  selection.addRange(range)
  // set focus
  isFocused.value = true
}

const copyToClipboard = async () => {
  isFocused.value = true
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true

    // Reset the copied state after 2 seconds
    if (resetTimeout.value) {
      window.clearTimeout(resetTimeout.value)
    }

    resetTimeout.value = window.setTimeout(() => {
      isCopied.value = false
      emit('copy')
    }, 1000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

onBeforeMount(() => {
  hljs.registerLanguage('python', python)
})

watchEffect(() => {
  if (codeRef.value && props.code) {
    setTimeout(() => {
      delete codeRef.value.dataset.highlighted
      hljs.highlightElement(codeRef.value)
    }, 0)
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
.copy-to-datalab-panel {
  position: relative;
  margin-bottom: 1rem;
  *::selection {
    background: var(--impresso-color-pastel-blue-alpha-20);
  }
  .code-container {
    position: relative;
    overflow-x: auto;
    border: 0px solid transparent;
    cursor: text;
    user-select: text;
    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: var(--bs-font-monospace);
      font-size: 0.875rem;
      tab-size: 2;
    }
    code {
      border-radius: var(--impresso-border-radius-sm);
      border: 1px solid transparent;
    }
  }

  .code-container.isFocused {
    border: 1px solid var(--impresso-color-pastel-blue) !important;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;

    .copy-button {
      float: right;
    }
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
