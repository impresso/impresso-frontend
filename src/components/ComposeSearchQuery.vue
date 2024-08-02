<template>
  <BDropdown
    class="ComposeSearchQuery m-1"
    size="sm"
    variant="outline-primary"
    initialIsOpen
    :text="$t('export_to_datalab')"
    right
  >
    <div class="p-2">
      <h2>options</h2>
      <b-form-checkbox v-model="isSerialized" switch>
        {{ $t('label_isSerialized') }}
      </b-form-checkbox>
    </div>
    <div class="p-2">
      <h2>search filters</h2>
      <SearchPills :filters="computedFilters" @changed="handleFiltersChanged" />
    </div>
    <div class="ComposeSearchQuery__result">
      <pre>{{ computedCode }}</pre>
      <button class="btn btn-primary">Run</button>
    </div>
  </BDropdown>
</template>
<script setup lang="ts">
import BDropdown from './legacy/bootstrap/BDropdown.vue'
import { defineProps, withDefaults, ref, computed } from 'vue'
import SearchPills from './SearchPills.vue'
import SearchQuery from '@/models/SearchQuery'
import FilterFactory from '@/models/FilterFactory'
import type { Filter, FilterInterface } from '@/models'

export interface Props {
  code: string
  filters: FilterInterface[]
}

const props = withDefaults(defineProps<Props>(), {
  code: 'import impresso\n\nimpresso.connect()\nimpresso.search($1)',
  filters: () => []
})

const glob: any = window
glob.impressoDocumentsYearSpan = {
  firstYear: 1780,
  lastYear: 2000
}

const handleFiltersChanged = (filters: any) => {
  emit('filtersChanged', filters)
}

const emit = defineEmits(['filtersChanged'])
const isSerialized = ref<boolean>(false)

const computedFilters = computed<Filter[] | FilterInterface[]>(() => {
  const filtersFromProps = props.filters.map(d => FilterFactory.create(d))
  return filtersFromProps
  // return filtersFromProps.concat(isFront.value ? [new FilterBoolean({ type: 'isFront' })] : [])
})

const computedCode = computed<string>(() => {
  const replaceable: string = isSerialized.value
    ? `as_sq="${new SearchQuery({
        filters: computedFilters.value
      }).getSerialized({ serializer: 'protobuf' })}"`
    : `as_dict=${JSON.stringify(
        computedFilters.value.map(f => f.getQuery()),
        null,
        2
      )}`
  return props.code.replace('$1', replaceable)
})
</script>
<i18n>
  {
    "en":{
      "export_to_datalab": "Export to Datalab",
      "label_isFront": "Is Front",
      "label_isSerialized": "Use compact version (serialized)"
    }
  }
</i18n>
<style>
.ComposeSearchQuery.dropdown.show > .dropdown-toggle {
  border-bottom: 1px solid white;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.ComposeSearchQuery__result {
  border-radius: var(--border-radius-sm);
  background-color: var(--dark);
  margin: 0 var(--spacing-2);
  padding: var(--spacing-2);
  min-width: 400px;
}
.ComposeSearchQuery__result pre {
  color: var(--white);
  font-family: var(--bs-font-monospace);
}

.ComposeSearchQuery h2 {
  text-transform: uppercase;
  font-family: var(--bs-font-sans-serif);
  font-size: var(--impresso-font-size-smallcaps);
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
</style>
