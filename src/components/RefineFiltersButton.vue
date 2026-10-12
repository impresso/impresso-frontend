<template>
  <button
    type="button"
    class="btn btn-outline-primary btn-sm px-2"
    :title="$t('actions.addFilter')"
    data-testid="add-filter-button"
    v-bind="$attrs"
    @click="openExplorer()"
  >
    <Icon name="filter" :stroke-width="2" :scale="1" :width="16" :height="16" />
  </button>
  <Teleport to="body">
    <Explorer
      :model-value="[]"
      :is-visible="isExplorerVisible"
      :initial-q="explorerInitialQ"
      :initial-type="explorerInitialType"
      :included-types="explorerIncludedTypes"
      :searching-enabled="true"
      @update:modelValue="handleExplorerFiltersChanged"
      @onHide="isExplorerVisible = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, Teleport } from 'vue'
import Icon from '@/components/base/Icon.vue'
import Explorer from '@/components/Explorer.vue'
import type { FacetType, Filter } from '@/models'

export interface RefineFiltersButtonProps {
  filters?: Filter[]
}

const props = withDefaults(defineProps<RefineFiltersButtonProps>(), {
  filters: () => []
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const explorerIncludedTypes: FacetType[] = [
  'mediaSource',
  'topic',
  'location',
  'person',
  'organisation',
  'nag',
  'collection'
]
const isExplorerVisible = ref(false)
const explorerInitialQ = ref('')
const explorerInitialType = ref<FacetType>('mediaSource')

const openExplorer = (options: { initialQ?: string; initialType?: FacetType } = {}) => {
  explorerInitialQ.value = options.initialQ ?? ''
  explorerInitialType.value = explorerIncludedTypes.includes(options.initialType as FacetType)
    ? (options.initialType as FacetType)
    : 'mediaSource'
  isExplorerVisible.value = true
}

const handleExplorerFiltersChanged = (filters: Filter[]) => {
  const filter = filters[0]
  if (filter) {
    emit('filtersChanged', [...props.filters, filter])
  }
}

defineExpose({ openExplorer })
</script>
