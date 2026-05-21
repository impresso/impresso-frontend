<template>
  <section class="mx-3">
    <span>Between</span>
    <div class="d-flex align-items-center">
      <BFormInput
        v-model="rangeStart"
        type="number"
        placeholder="Min"
        size="sm"
        :debounce="300"
        :step="props.step"
        :min="props.min"
        :max="props.max"
        class="px-2 py-0 rounded"
      />
      <div class="mx-2 text-small">and</div>
      <BFormInput
        v-model="rangeEnd"
        type="number"
        placeholder="Max"
        size="sm"
        :debounce="300"
        :step="props.step"
        :min="props.min"
        :max="props.max"
        class="px-2 py-0 rounded"
      />
    </div>

    <div v-if="!pristine" class="mt-2 border-top pt-2 text-center">
      <b-button
        size="sm"
        variant="outline-secondary"
        class="btn btn-sm btn-outline"
        @click="applyFilter"
      >
        {{ $t('actions.previewFilter') }}
      </b-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Filter } from '@/models'

export interface SelectionMonitorFilterProps {
  filter: Filter
  step?: number
  min?: number
  max?: number
}

const props = defineProps<SelectionMonitorFilterProps>()

const emit = defineEmits<{
  (e: 'changeFilter', value: Filter): void
}>()

const rangeStart = ref<string>('')
const rangeEnd = ref<string>('')

const pristine = computed(() => {
  const q = props.filter.q
  if (Array.isArray(q)) {
    return rangeStart.value === q[0] && rangeEnd.value === q[1]
  }
  return false
})

watch(
  () => props.filter,
  newFilter => {
    const q = newFilter.q
    if (Array.isArray(q)) {
      rangeStart.value = q[0] ?? ''
      rangeEnd.value = q[1] ?? ''
    }
  },
  { immediate: true, deep: true }
)

function applyFilter(): void {
  emit('changeFilter', { ...props.filter, q: [rangeStart.value, rangeEnd.value] })
}
</script>
