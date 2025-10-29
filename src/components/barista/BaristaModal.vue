<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClasses="InfoModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
  >
    <p>{{ $t('BaristaTitle') }}</p>
    <div class="container-fluid">
      <div class="row">
        <div class="col-6">
          <slot></slot>
        </div>

        <div class="col-6 results-section">
          <h5>Results (JSON)</h5>
          <div v-if="formattedJSON">
            <pre class="json-display">{{ formattedJSON }}</pre>
            <button class="btn btn-sm btn-primary mt-2" @click="applyFilters">Apply Filters</button>
          </div>
          <p v-else>No results yet</p>
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
import { computed } from 'vue'
import { getSearchFiltersAsBase64 } from '@/services/types/barista'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: string | object
}

const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-dialog-centered  modal-lg',
  isVisible: false,
  filters: null
})

const emit = defineEmits(['dismiss', 'applyFilters'])

function dismiss() {
  emit('dismiss')
}

function tryParseJSON(value: any): any {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      // Recursively process any nested "arguments" fields
      return tryParseJSON(parsed)
    } catch {
      return value
    }
  } else if (Array.isArray(value)) {
    return value.map(tryParseJSON)
  } else if (value && typeof value === 'object') {
    const parsedObj: Record<string, any> = {}
    for (const [key, val] of Object.entries(value)) {
      parsedObj[key] = tryParseJSON(val)
    }
    return parsedObj
  }
  return value
}

const formattedJSON = computed(() => {
  if (!props.filters) return ''
  try {
    const base = typeof props.filters === 'string' ? JSON.parse(props.filters) : props.filters

    const clean = tryParseJSON(base)
    return JSON.stringify(clean, null, 2)
  } catch {
    return String(props.filters)
  }
})

const applyFilters = () => {
  if (!props.filters) return
  try {
    const parsed = typeof props.filters === 'string' ? JSON.parse(props.filters) : props.filters

    const encoded = getSearchFiltersAsBase64(parsed)

    emit('applyFilters', encoded)
  } catch (err) {
    console.error('Error applying filters:', err)
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "BaristaTitle": "Barista is our AI assistant that helps you find a good search query based on your questions.",
    "BaristaModalTitle": "Ask Barista"
  }
}
</i18n>
