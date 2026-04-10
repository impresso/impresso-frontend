<template>
  <div class="filter-range" data-testid="filter-range">
    <BaseTitleBar>
      {{ $t(`label.${facet.type}.filterTitle`) }}
      <InfoButton class="ml-1" :target="facet.type" name="filter-range" />

      <template v-slot:options>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="handleResetFilters"
          v-if="value.length === 2"
        >
          {{ $t('actions.reset') }}
        </b-button>
      </template>
    </BaseTitleBar>
    <HistogramSlider
      class="histo-slider"
      v-model="sliderValue"
      :buckets="sliderBuckets"
      :only-range-labels="true"
      :scale-type="'symlog'"
      :show-tooltip="true"
      @change="changeValue"
    />

    <div class="p-2" v-if="valuesHaveChanged">
      <div class="row g-0">
        <div class="col pe-1">
          <b-button size="sm" block variant="outline-primary" @click="resetValues">
            {{ $t('actions.dismiss') }}
          </b-button>
        </div>
        <div class="col ps-1">
          <b-button size="sm" block variant="outline-primary" @click="applyValues">
            {{ $t('actions.apply') }}
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import HistogramSlider from '@/components/modules/vis/HistogramSlider.vue'
import type { Facet, Filter } from '@/models'
import { computed, ref } from 'vue'

export interface FilterRangeProps {
  facet: Facet
  facetFilters: Filter[]
}

const props = defineProps<FilterRangeProps>()

const emit = defineEmits<{
  (e: 'changed', value: Filter[]): void
}>()

const value = ref<number[]>([])

const sliderBuckets = computed(() => {
  return props.facet.buckets
})

const filterValue = computed<number[]>(() => {
  if (props.facetFilters.length === 0) return []
  const firstFilter = props.facetFilters[0]
  if (typeof firstFilter.q === 'undefined') return []
  if (!Array.isArray(firstFilter.q)) return [Number.parseInt(firstFilter.q, 10)]
  return firstFilter.q.map(v => Number.parseInt(v, 10))
})

const valuesHaveChanged = computed(() => {
  return (
    value.value.length === 2 && JSON.stringify(value.value) !== JSON.stringify(filterValue.value)
  )
})

const sliderValue = computed<number[]>({
  get() {
    if (value.value.length === 2) return value.value
    return filterValue.value
  },
  set(val: number[]) {
    value.value = val
  }
})

function changeValue(val: number[]) {
  value.value = val
}

function resetValues() {
  value.value = []
}

function applyValues() {
  if (value.value.length !== 2) {
    emit('changed', [])
    return
  }

  emit('changed', [
    {
      type: props.facet.type as Filter['type'],
      q: value.value.map(v => v.toString())
    } as Filter
  ])
}

function handleResetFilters() {
  value.value = []
  applyValues()
}
</script>
