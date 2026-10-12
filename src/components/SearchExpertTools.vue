<template>
  <div class="SearchExpertTools" v-bind="$attrs">
    <h3 class="small-caps-bold m-0">{{ $t('label_expertAgenticSearch') }}</h3>
    <p class="small">{{ $t('label_expertAgenticSearch') }}</p>
    <div class="mt-1 d-flex gap-1 justify-content-between align-items-center flex-wrap">
      <button
        type="button"
        :class="btnClass"
        :title="$t('actions.addFilter')"
        @click="openExplorer()"
        data-testid="add-filter-button"
      >
        <span>{{ $t('actions.refine') }}</span>
        <Icon name="arrowEnlargeTag" :stroke-width="1.25" :scale="1" />
      </button>
      <SemanticSearchButton :class="btnClass" @search="emit('semanticSearch', $event)">
        <span>{{ $t('actions.semanticSearch') }}</span>
      </SemanticSearchButton>
      <AuthGate v-if="isBaristaEnabled">
        <template #authenticated>
          <BaristaButton
            :filters="canonicalFilters"
            @filtersChanged="emit('filtersChanged', $event)"
            :class="btnClass"
          >
            {{ $t('actions.barista') }}
            <Icon name="coffeeCup" :stroke-width="1.75" :scale="0.75" />
          </BaristaButton>
        </template>
      </AuthGate>
      <button
        v-else
        class="btn btn-sm btn-outline-secondary d-flex align-content-center px-2"
        disabled
      >
        <span>{{ $t('actions.barista') }}</span>
        <Icon name="coffeeCup" :stroke-width="1.25" :scale="1" />
      </button>
    </div>
  </div>
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthGate from '@/components/AuthGate.vue'
import BaristaButton from '@/components/barista/BaristaButton.vue'
import Icon from '@/components/base/Icon.vue'
import Explorer from '@/components/Explorer.vue'
import SemanticSearchButton from '@/components/SemanticSearchButton.vue'
import { toCanonicalFilter } from '@/logic/filters'
import type { FacetType, Filter } from '@/models'

export interface SearchExpertToolsProps {
  filters?: Filter[]
  btnClass?: string
  isBaristaEnabled?: boolean
}

const props = withDefaults(defineProps<SearchExpertToolsProps>(), {
  filters: () => [],
  btnClass: 'btn btn-sm btn-outline-secondary d-flex gap-1 align-content-center px-2',
  isBaristaEnabled: false
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  (e: 'semanticSearch', payload: { text: string; embedding: string }): void
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const canonicalFilters = computed(() => props.filters.map(toCanonicalFilter))
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
<i18n lang="json">
{
  "en": {
    "label_expertAgenticSearch": "Expert / Agentic Search"
  }
}
</i18n>
