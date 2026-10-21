<template>
  <button
    class="d-flex align-items-center justify-content-center"
    @click="toggleChat"
    :class="{ active: isChatOpen }"
    aria-label="Toggle Barista Chat"
    v-bind="$attrs"
    :title="$t('actions.openBaristaModal')"
  >
    <Icon name="sparks" :scale="1" :stroke-width="1.5" />
  </button>
  <Teleport to="body">
    <BaristaModal
      :isVisible="isChatOpen && mode === 'full'"
      :filters="props.filters"
      v-model:suggestedFilters="suggestedFilters"
      @dismiss="closeChat"
      @compact="mode = 'compact'"
      @applyFilters="applyAndClose"
    />
    <BaristaMiniPanel
      v-if="isChatOpen && mode === 'compact'"
      :filters="props.filters"
      v-model:suggestedFilters="suggestedFilters"
      @dismiss="closeChat"
      @expand="mode = 'full'"
      @applyFilters="apply"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaristaModal from './BaristaModal.vue'
import BaristaMiniPanel from './BaristaMiniPanel.vue'
import Icon from '@/components/base/Icon.vue'
import type { Filter } from '@/models'

defineOptions({
  inheritAttrs: false
})

export type BaristaMode = 'full' | 'compact'

export interface BaristaButtonProps {
  filters?: Filter[]
  initialMode?: BaristaMode
}

const props = withDefaults(defineProps<BaristaButtonProps>(), {
  filters: () => [],
  initialMode: 'full'
})

const emit = defineEmits<{
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const isChatOpen = ref(false)
const mode = ref<BaristaMode>(props.initialMode)
/** shared by the full and the compact view, so switching between them keeps the suggestion */
const suggestedFilters = ref<Filter[] | undefined>(undefined)

const toggleChat = () => (isChatOpen.value = !isChatOpen.value)
const closeChat = () => (isChatOpen.value = false)

/** the compact window floats over the results, so it stays open to keep refining the search */
const apply = (filters: Filter[]) => emit('filtersChanged', filters)
const applyAndClose = (filters: Filter[]) => {
  apply(filters)
  closeChat()
}
</script>
<i18n lang="json">
{
  "en": {
    "actions": {
      "openBaristaModal": "Improve your search with Barista"
    }
  }
}
</i18n>
