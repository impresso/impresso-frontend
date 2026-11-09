<template>
  <div v-show="showControls" class="SearchExpertTools" v-bind="$attrs">
    <h3 class="small-caps-bold m-0">{{ $t('label_expertAgenticSearch') }}</h3>
    <p class="small">{{ $t('label_expertAgenticSearch') }}</p>
    <div class="mt-1 d-flex gap-1 justify-content-between align-items-center flex-wrap">
      <SemanticSearchButton
        ref="semanticSearchButtonRef"
        :class="btnClass"
        :disabled="!isLoggedIn"
        @search="emit('semanticSearch', $event)"
      >
        <span>{{ $t('actions.semanticSearch') }}</span>
      </SemanticSearchButton>
      <BaristaButton
        v-if="isBaristaEnabled && isLoggedIn"
        ref="baristaButtonRef"
        :filters="canonicalFilters"
        @filtersChanged="emit('filtersChanged', $event)"
        :class="btnClass"
      >
        {{ $t('actions.barista') }}
        <Icon name="coffeeCup" :stroke-width="1.75" :scale="0.75" />
      </BaristaButton>
      <button
        v-else
        :class="btnClass"
        disabled
      >
        <span>{{ $t('actions.barista') }}</span>
        <Icon name="coffeeCup" :stroke-width="1.25" :scale="1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaristaButton from '@/components/barista/BaristaButton.vue'
import Icon from '@/components/base/Icon.vue'
import SemanticSearchButton from '@/components/SemanticSearchButton.vue'
import { toCanonicalFilter } from '@/logic/filters'
import type { Filter } from '@/models'

export interface SearchExpertToolsProps {
  filters?: Filter[]
  btnClass?: string
  isBaristaEnabled?: boolean
  isLoggedIn?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<SearchExpertToolsProps>(), {
  filters: () => [],
  btnClass: 'btn btn-sm btn-outline-secondary d-flex gap-1 align-content-center px-2',
  isBaristaEnabled: false,
  isLoggedIn: false,
  showControls: true
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  (e: 'semanticSearch', payload: { text: string; embedding: string }): void
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const canonicalFilters = computed(() => props.filters.map(toCanonicalFilter))
const semanticSearchButtonRef = ref<{
  openModal(initialText?: string): void
} | null>(null)
const baristaButtonRef = ref<{
  openChat(prompt?: string): void
} | null>(null)

const openSemanticSearch = (text: string) => {
  if (props.isLoggedIn) {
    semanticSearchButtonRef.value?.openModal(text)
  }
}

const openBarista = (prompt: string) => {
  if (props.isLoggedIn) {
    baristaButtonRef.value?.openChat(prompt)
  }
}

defineExpose({ openSemanticSearch, openBarista })
</script>
<i18n lang="json">
{
  "en": {
    "label_expertAgenticSearch": "Expert / Agentic Search"
  }
}
</i18n>
