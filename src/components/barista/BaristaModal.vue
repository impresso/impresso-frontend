<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClasses="InfoModal"
    :dialogClass="props.dialogClass"
    body-class="p-0"
    @close="dismiss"
  >
    <p class="p-3 text-center">{{ $t('BaristaTitle') }}</p>
    <div class="container-fluid">
      <div class="row" style="min-height: 50vh">
        <div class="col-6">
          <slot></slot>
        </div>

  <div class="col-6 results-section position-relative">
  <div class="position-sticky top-0 bg-white py-2">
    <SearchPills :filters="searchFilters" @changed="handleFiltersChanged" />
    <button
      class="btn btn-sm btn-primary mt-2"
      @click="applyFilters"
    >
      Apply Filters
    </button>
  </div>
  <h5>Results (JSON)</h5>
  <div class="bg-light p-2 my-2 rounded small">
        <div v-if="props.aiFilters && Object.keys(props.aiFilters).length">
      <!-- {{ searchFilters }} -->
     <pre class="json-display">{{ JSON.stringify(props.aiFilters, null, 2) }}</pre> 
    </div>
    <p v-else>No results yet</p>
  </div>
</div>
      </div>
    </div>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">
        {{ $t('close') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getSearchFilters, getSearchFiltersAsBase64 } from '@/services/types/barista'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import SearchPills from '../SearchPills.vue'
import { joinFiltersWithItems, toSerializedFilters } from '@/logic/filters'
import { filtersItems } from '@/services'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: string | object
  aiFilters?: any    
}

const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-dialog-centered  modal-lg',
  isVisible: false,
  filters: null,
  aiFilters: null
})

const emit = defineEmits(['dismiss', 'applyFilters'])

function dismiss() {
  emit('dismiss')
}

// function tryParseJSON(value: any): any {
//   if (typeof value === 'string') {
//     try {
//       const parsed = JSON.parse(value)
//       // Recursively process any nested "arguments" fields
//       return tryParseJSON(parsed)
//     } catch {
//       return value
//     }
//   } else if (Array.isArray(value)) {
//     return value.map(tryParseJSON)
//   } else if (value && typeof value === 'object') {
//     const parsedObj: Record<string, any> = {}
//     for (const [key, val] of Object.entries(value)) {
//       parsedObj[key] = tryParseJSON(val)
//     }
//     return parsedObj
//   }
//   return value
// }


const searchFilters = ref([])
const handleFiltersChanged = (newFilters: any) => {
  searchFilters.value = newFilters
}
const searchFiltersFromBarista = computed(() => {
  if (!props.filters) return []
  return getSearchFilters(
    typeof props.filters === 'string' ? JSON.parse(props.filters) : props.filters
  )
})

const applyFilters = () => {
  if (!props.filters) return
  emit('applyFilters', toSerializedFilters(searchFilters.value))
}

watch(
  () => searchFiltersFromBarista.value,
  async newFilters => {
    // merge filters
    searchFilters.value = newFilters

    const filtersWithItems = await filtersItems
      .find({ query: { filters: toSerializedFilters(newFilters) } })
      .then(joinFiltersWithItems)
    searchFilters.value = filtersWithItems
    // eslint-disable-next-line
    console.debug('[BaristaModal] loadFilterItems', filtersWithItems)
  },
  { immediate: true }
)
</script>

<i18n lang="json">
{
  "en": {
    "BaristaTitle": "Barista is our AI assistant that helps you find a good search query based on your questions.",
    "BaristaModalTitle": "Ask Barista"
  }
}
</i18n>
