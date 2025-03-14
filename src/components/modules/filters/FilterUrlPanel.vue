<template>
  <div class="filter-url-panel">
    <div v-for="(url, index) in encodedUrls" :key="index" class="filter-url-panel__url">
      <div class="filter-url-panel__url-label">{{ url.label }}</div>
      <div class="filter-url-panel__url-container">
        <input
          type="text"
          :value="url.value"
          readonly
          class="filter-url-panel__url-input"
          @click="selectAllText"
        />
        <a
          :href="url.value"
          target="_blank"
          rel="noopener noreferrer"
          class="filter-url-panel__url-link"
          title="Open in new tab"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Filter } from '@/models'
import { toSerializedFilters } from '@/logic/filters'

interface Props {
  filters: Filter[]
}

const props = defineProps<Props>()

// Base URLs for different environments
const URLs = {
  prod: 'https://impresso-project.ch/app',
  dev: 'https://dev.impresso-project.ch/app'
}

const Suffixes = {
  search: 'search?sq=',
  textReuse: 'text-reuse?sq=',
  compare: 'compare?left='
}

const encodedUrls = computed(() => {
  const base64Filters = toSerializedFilters(props.filters)
  return Object.entries(Suffixes)
    .map(([suffixKey, suffixValue]) => {
      return Object.entries(URLs).map(([key, value]) => {
        return {
          label: `${key.toLocaleUpperCase()} ${suffixKey}:`,
          value: `${value}/${suffixValue}${base64Filters}`
        }
      })
    })
    .flat()
})

const selectAllText = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.select()
}
</script>

<style scoped>
.filter-url-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-url-panel__url {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-url-panel__url-label {
  font-weight: bold;
  font-size: 0.875rem;
}

.filter-url-panel__url-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.filter-url-panel__url-input {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-family: monospace;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.filter-url-panel__url-input:focus {
  outline: none;
  border-color: var(--impresso-color-primary, #000);
}

.filter-url-panel__url-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: var(--impresso-color-primary, #000);
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-url-panel__url-link:hover {
  background-color: #f5f5f5;
  border-color: var(--impresso-color-primary, #000);
}
</style>
