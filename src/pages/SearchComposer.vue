<template>
  <main class="container">
    <h1>Search Query composer</h1>
    <div class="row">
      <div class="col-6">
        <textarea
          class="form-control"
          rows="10"
          :value="inputText"
          @input="onInputTextarea"
        ></textarea>
        <div v-if="inputTextErrors.length > 0">
          <ul>
            <li v-for="error in inputTextErrors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>

      <div class="col-6">
        <SearchPills :filters="computedFilters" @changed="onFiltersChanged" />
        <div>
          serialized:
          <pre>{{ serialized }}</pre>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import SearchPills from '@/components/SearchPills.vue'
import type { Filter, FilterInterface } from '@/models'
import FilterFactory from '@/models/FilterFactory'
import SearchQuery from '@/models/SearchQuery'
import { computed, onMounted, ref } from 'vue'

const glob: any = window
glob.impressoDocumentsYearSpan = {
  firstYear: 1780,
  lastYear: 2000
}

const parseFiltersFromInputText = (value: string) => {
  let parsedFilters = []

  try {
    parsedFilters = JSON.parse(value)
    inputTextErrors.value = []
  } catch (e) {
    console.error(e.code, e.message)
    inputTextErrors.value = [e.message]
    return
  }
  // Try to parse the JSON string into an array of Filter objects
  if (!Array.isArray(parsedFilters)) {
    inputTextErrors.value = ['Input is not an array']
    return
  }
  // try to create the serialized query :)
  try {
    serialized.value = String(
      new SearchQuery({
        filters: parsedFilters.map(d => FilterFactory.create(d))
      }).getSerialized({ serializer: 'protobuf' })
    )
  } catch (e) {
    inputTextErrors.value = ['Input not valid for creating a serialized query', e.message]
    return
  }
  filters.value = parsedFilters
}

const inputText = ref<string>('[{"type":"isFront"},{"type":"string","q":["soleil","lune"]}]')
const inputTextErrors = ref<string[]>([])
const serialized = ref<string>('')
const filters = ref<Filter[]>([])

const onInputTextarea = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  inputText.value = value
  parseFiltersFromInputText(value)
}

const onFiltersChanged = (filters: any) => {
  const value = JSON.stringify(
    filters.map(
      d => {
        const filter: FilterInterface = FilterFactory.create(d) as FilterInterface
        return filter.getQuery()
      },
      null,
      2
    )
  )
  inputText.value = value
  parseFiltersFromInputText(value)
}

const computedFilters = computed<Filter[]>(() => {
  return filters.value.map(d => FilterFactory.create(d))
})

onMounted(() => {
  parseFiltersFromInputText(inputText.value)
})
</script>
<style scoped>
h1 {
  color: red;
}
</style>
