<template>
  <div class="filter-text-input">
    <textarea
      :value="modelValue"
      @input="handleInput"
      class="filter-text-input__field"
      placeholder="Paste base64 filter string or URL"
      rows="4"
    ></textarea>
    <div v-if="errorMessage" class="filter-text-input__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { deserializeFilters } from '@/logic/filters'
import { ref, watch, defineProps, defineEmits } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emits = defineEmits(['update:modelValue', 'update:filterString'])

const errorMessage = ref<string | null>(null)

/**
 * Extracts base64 filter string from URL query parameters
 * @param url The URL to parse
 * @returns The extracted base64 filter string or null if not found
 */
const extractFilterFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url)
    // Look for the filter parameter in various common parameter names
    const possibleParams = parsedUrl.searchParams.keys()

    for (const param of possibleParams) {
      const value = parsedUrl.searchParams.get(param)
      if (value && isLikelyFilterBase64(value)) {
        return value
      }
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Checks if a string is likely a base64 encoded filter
 * @param str The string to check
 * @returns Boolean indicating if the string appears to be base64
 */
const isLikelyFilterBase64 = (str: string): boolean => {
  try {
    deserializeFilters(str)
    return true
  } catch (error) {
    console.log('eee', str, error)
    return false
  }
}

const onValueChanged = (inputValue: string) => {
  emits('update:modelValue', inputValue)

  errorMessage.value = null

  if (!inputValue) {
    emits('update:filterString', '')
    return
  }

  // Check if input is a URL
  if (inputValue.startsWith('http://') || inputValue.startsWith('https://')) {
    const filterValue = extractFilterFromUrl(inputValue)

    if (filterValue) {
      emits('update:filterString', filterValue)
    } else {
      emits('update:filterString', '')
      errorMessage.value = 'Could not extract filter from URL'
    }
    return
  }

  // If not a URL, assume it's a base64 string
  if (isLikelyFilterBase64(inputValue)) {
    emits('update:filterString', inputValue)
  } else {
    emits('update:filterString', '')
    errorMessage.value = 'Input is not a valid base64 string or URL'
  }
}

const handleInput = (event: Event) => {
  const inputValue = (event.target as HTMLInputElement).value.trim()
  onValueChanged(inputValue)
}

// Watch for external changes to model value
watch(() => props.modelValue, onValueChanged, { immediate: true })
</script>

<style scoped>
.filter-text-input {
  margin-bottom: 1rem;
}

.filter-text-input__field {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.filter-text-input__error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
