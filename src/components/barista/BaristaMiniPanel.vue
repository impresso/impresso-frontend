<template>
  <div class="BaristaMiniPanel__overlay pointer-events-none">
    <ModalDraggable
      respect-boundaries
      :initial-x="initialPosition.x"
      :initial-y="initialPosition.y"
      class="BaristaMiniPanel pointer-events-auto"
      handle-class="BaristaMiniPanel__handle"
    >
      <template #header="{ isReduced, toggleReduced }">
        <div class="BaristaMiniPanel__header">
          <Icon
            v-if="!isReduced"
            name="dots"
            :scale="0.3"
            :stroke-width="8"
            color="black"
            class="BaristaMiniPanel__grip"
          />
          <div class="BaristaMiniPanel__heading">
            <span class="small-caps BaristaMiniPanel__kicker">
              {{ $t('title') }}
              <span v-if="baristaStore.isWorking" class="BaristaMiniPanel__working">
                · {{ $t('working') }}
              </span>
            </span>
            <span v-if="conversationLabel && !isReduced" class="BaristaMiniPanel__conversation">
              {{ conversationLabel }}
            </span>
          </div>
          <div class="BaristaMiniPanel__actions">
            <template v-if="!isReduced">
              <BaristaIconButton
                icon="plus"
                :label="$t('newChat')"
                :disabled="!hasMessages"
                @click.stop="resetChat"
              />
              <BaristaIconButton icon="expand" :label="$t('expand')" @click.stop="emit('expand')" />
            </template>
            <BaristaIconButton
              icon="chevron"
              :stroke-width="2"
              :label="isReduced ? $t('restore') : $t('minimise')"
              :class="{ BaristaMiniPanel__restore: isReduced }"
              @click.stop="toggleReduced"
            />
            <BaristaIconButton icon="cross" :label="$t('close')" @click.stop="emit('dismiss')" />
          </div>
        </div>
      </template>

      <div class="BaristaMiniPanel__body">
        <BaristaFiltersTray
          class="BaristaMiniPanel__filters"
          :suggested-filters="suggestedFilters"
          :filters-with-items="suggestedFiltersWithItems"
          :current-filters="props.filters"
          @changed="handleFiltersChanged"
          @apply="handleApplyFilters"
        />
        <BaristaChat
          class="BaristaMiniPanel__chat"
          :filters="suggestedFilters"
          @suggestFilters="handleFiltersChanged"
        />
      </div>
    </ModalDraggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Filter } from '@/models'
import ModalDraggable from '@/components/ModalDraggable.vue'
import Icon from '@/components/base/Icon.vue'
import BaristaChat from '@/components/barista/BaristaChat.vue'
import BaristaFiltersTray from '@/components/barista/BaristaFiltersTray.vue'
import BaristaIconButton from '@/components/barista/BaristaIconButton.vue'
import { useBaristaStore } from '@/stores/barista'
import { useBaristaSuggestedFilters } from '@/composables/useBaristaSuggestedFilters'

export interface BaristaMiniPanelProps {
  filters?: Filter[]
  /** Filters suggested by Barista, kept in sync with the full view */
  suggestedFilters?: Filter[]
}

const props = withDefaults(defineProps<BaristaMiniPanelProps>(), {
  filters: () => []
})

const emit = defineEmits<{
  dismiss: []
  expand: []
  applyFilters: [filters: Filter[]]
  'update:suggestedFilters': [filters: Filter[]]
}>()

// keep in sync with the panel size defined in css
const PanelWidth = 376
const PanelMaxHeight = 576
const ViewportMargin = 24

const initialPosition = computed(() => {
  const height = Math.min(PanelMaxHeight, window.innerHeight * 0.78)
  return {
    x: Math.max(0, window.innerWidth - PanelWidth - ViewportMargin),
    y: Math.max(0, window.innerHeight - height - ViewportMargin)
  }
})

const baristaStore = useBaristaStore()
const hasMessages = computed(() => baristaStore.messages.length > 0)
const conversationLabel = computed(() => baristaStore.currentConversation?.label)

const { suggestedFilters, suggestedFiltersWithItems, handleFiltersChanged } =
  useBaristaSuggestedFilters({
    filters: () => props.filters,
    suggestedFilters: () => props.suggestedFilters,
    onSuggestedFiltersChange: filters => emit('update:suggestedFilters', filters)
  })

const resetChat = () => {
  baristaStore.createNewSession()
}

const handleApplyFilters = () => {
  emit('applyFilters', suggestedFilters.value)
}
</script>

<i18n lang="json">
{
  "en": {
    "title": "Barista",
    "working": "working",
    "newChat": "New chat",
    "expand": "Open full view",
    "minimise": "Minimise",
    "restore": "Restore",
    "close": "Close"
  }
}
</i18n>

<style>
.BaristaMiniPanel__overlay {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 1035;
}
.BaristaMiniPanel {
  width: min(23.5rem, calc(100vw - 1.5rem));
  height: min(36rem, 78vh);
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--border-radius-md);
  background-color: var(--impresso-color-white);
  box-shadow: var(--bs-box-shadow-lg);
}
.BaristaMiniPanel.ModalDraggable--reduced {
  width: auto;
  min-width: 15rem;
  height: auto;
}
.BaristaMiniPanel .ModalDraggable__handle {
  border-bottom: 1px solid var(--clr-grey-700);
}
.BaristaMiniPanel.ModalDraggable--reduced .ModalDraggable__handle {
  border-bottom: 0;
}
.BaristaMiniPanel .ModalDraggable__handle:hover,
.BaristaMiniPanel .ModalDraggable__handle:active {
  opacity: 1;
}
.BaristaMiniPanel.ModalDraggable--bounded .ModalDraggable__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: auto;
  user-select: text;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
}
.BaristaMiniPanel__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.375rem 0.375rem 0.75rem;
}
.BaristaMiniPanel__grip {
  flex: 0 0 auto;
  opacity: 0.5;
}
.BaristaMiniPanel__heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
  line-height: 1.2;
}
.BaristaMiniPanel__kicker {
  color: var(--clr-grey-300);
}
.BaristaMiniPanel__working {
  font-style: italic;
}
.BaristaMiniPanel__conversation {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
}
.BaristaMiniPanel__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex: 0 0 auto;
}
.BaristaMiniPanel__restore .Icon {
  transform: rotate(180deg);
}
.BaristaMiniPanel__body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.BaristaMiniPanel__filters {
  flex: 0 0 auto;
  border-bottom: 1px solid var(--clr-grey-700);
}
.BaristaMiniPanel__chat {
  flex: 1 1 auto;
  min-height: 0;
}
.BaristaMiniPanel .BaristaMiniPanel__chat .chat-history {
  padding: 0.75rem;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}
.BaristaMiniPanel .BaristaMiniPanel__chat .BaristaChatInput {
  padding: 0.625rem 0.75rem 0.75rem;
  border-top: 1px solid var(--clr-grey-700);
}
.BaristaMiniPanel .BaristaMiniPanel__chat .BaristaChatPanel__title {
  font-size: 1.125rem;
}
.BaristaMiniPanel .BaristaMiniPanel__chat .BaristaChatPanel__intro {
  font-size: 0.8125rem;
}
.BaristaMiniPanel__chat .BaristaChatMessage__content {
  max-width: 92%;
  font-size: 0.875rem;
}
</style>
