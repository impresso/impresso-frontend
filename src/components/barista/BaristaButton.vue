<template>
  <button
    class="d-flex align-items-center justify-content-center"
    @click="toggleChat"
    :class="{ active: isChatOpen }"
    aria-label="Toggle Barista Chat"
    v-bind="$attrs"
    :title="$t('actions.openBaristaModal')"
  >
    <slot>
      <Icon name="sparks" :scale="1" :stroke-width="1.5" />
    </slot>
  </button>
  <Teleport to="body">
    <BaristaModal
      :isVisible="isChatOpen"
      :filters="baristaSearchFilters"
      :initial-prompt="initialPrompt"
      @dismiss="closeChat"
      @applyFilters="handleApplyFilters"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaristaModal from './BaristaModal.vue'
import Icon from '../base/Icon.vue'
import type { Filter } from '@/models'

defineOptions({
  inheritAttrs: false
})

const isChatOpen = ref(false)
const initialPrompt = ref('')
const emit = defineEmits<{
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const handleApplyFilters = (filters: Filter[]) => {
  emit('filtersChanged', filters)
  closeChat()
}
/**
 * Props
 */
export interface BaristaButtonProps {
  filters?: Filter[]
}

const props = withDefaults(defineProps<BaristaButtonProps>(), {
  filters: () => []
})

const baristaSearchFilters = ref<Filter[]>([])

const toggleChat = () => {
  if (!isChatOpen.value) {
    initialPrompt.value = ''
  }
  isChatOpen.value = !isChatOpen.value
}

const openChat = (prompt = '') => {
  initialPrompt.value = prompt
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

watch(
  () => props.filters,
  (newFilters: Filter[]) => {
    console.debug('[BaristaButton] Detected filters change from props:', newFilters)
    baristaSearchFilters.value = newFilters
  },
  { immediate: true }
)

defineExpose({ openChat })
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
