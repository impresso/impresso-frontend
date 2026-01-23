<template>
  <button
    class="d-flex align-items-center justify-content-center"
    @click="toggleChat"
    :class="{ active: isChatOpen }"
    aria-label="Toggle Barista Chat"
    v-bind="$attrs"
    :title="$t('openBaristaModal')"
  >
    <Icon name="sparks" :scale="1" :stroke-width="1.5" />
  </button>
  <Teleport to="body">
    <BaristaModal
      :isVisible="isChatOpen"
      :filters="baristaSearchFilters"
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
const emit = defineEmits<{
  (e: 'filtersChanged', filters: Filter[]): void
}>()

const handleApplyFilters = (filters: Filter[]) => {
  emit('filtersChanged', filters)
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
  isChatOpen.value = !isChatOpen.value
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
</script>
