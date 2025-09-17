<template>
  <div class="filter-json-input">
    <div class="filter-json-input__fields">
      <div class="filter-json-input__fields-title">Available filter fields:</div>
      <ul class="filter-json-input__fields-list">
        <li v-for="field in filterFields" :key="field" class="filter-json-input__fields-item">
          {{ field }}
        </li>
      </ul>
    </div>
    <textarea
      :value="currentInput"
      @input="handleInput"
      class="filter-json-input__field"
      placeholder="Paste JSON filter string"
      rows="12"
    ></textarea>
    <div v-if="errorMessage" class="filter-json-input__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { jsonSchemas, Filter } from 'impresso-jscommons'
import Ajv, { ErrorObject } from 'ajv'

const ajv = new Ajv({ allErrors: true })
const validateFiltersSchema = ajv.compile({
  type: 'array',
  items: { ...jsonSchemas.Filter, additionalProperties: false }
})

const filterFields = Object.keys(jsonSchemas.Filter.properties)

interface Props {
  initialValue: string
}

const props = defineProps<Props>()
const emits = defineEmits<{
  'update:filters': [value: Filter[]]
}>()

const currentInput = ref<string>(props.initialValue)
const errorMessage = ref<string | null>(null)

const formatAjvError = (error: ErrorObject): string => {
  return `${error.instancePath}: ${error.message} (${JSON.stringify(error.params)})`
}

const validateJson = (value: string): Filter[] | null => {
  try {
    const parsedJson = JSON.parse(value)

    // Validate it's an array
    if (!Array.isArray(parsedJson)) {
      throw new Error('Input must be an array of filters')
    }

    const isValid = validateFiltersSchema(parsedJson)

    if (!isValid) {
      throw new Error(validateFiltersSchema.errors.map(formatAjvError).join('\n'))
    }

    return parsedJson
  } catch (error) {
    return error
  }
}

const onValueChanged = (value: string) => {
  if (!value) {
    errorMessage.value = null
    emits('update:filters', [])
    return
  }

  const validatedFilters = validateJson(value)
  if (validatedFilters instanceof Error) {
    errorMessage.value = validatedFilters.message
    emits('update:filters', [])
    return
  } else {
    errorMessage.value = null
    emits('update:filters', validatedFilters)
  }
}

const handleInput = (event: Event) => {
  const inputValue = (event.target as HTMLTextAreaElement).value.trim()
  currentInput.value = inputValue
}

// Watch for changes to value
watch(() => currentInput.value, onValueChanged, { immediate: true })
watch(
  () => props.initialValue,
  value => {
    currentInput.value = value
  }
)
</script>

<style scoped>
.filter-json-input {
  margin-bottom: 1rem;
}

.filter-json-input__field {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.filter-json-input__error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.filter-json-input__fields {
  margin-bottom: 0.5rem;
}

.filter-json-input__fields-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.filter-json-input__fields-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-json-input__fields-item {
  background-color: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
}
</style>
