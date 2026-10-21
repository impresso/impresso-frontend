<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClass="BaristaModal"
    :dialogClass="props.dialogClass"
    content-class="h-100"
    bodyClass="BaristaModal__body p-0"
    @close="dismiss"
    hide-footer
  >
    <template v-slot:modal-header>
      <div class="BaristaModal__heading">
        <p class="small-caps BaristaModal__kicker">{{ $t('BaristaModalTitle') }}</p>
        <template v-if="baristaStore.currentConversation">
          <button
            v-if="!editingTitle"
            type="button"
            class="BaristaModal__conversation"
            :title="$t('click to rename')"
            @click="startEditingTitle"
          >
            {{ baristaStore.currentConversation.label }}
          </button>
          <div v-else class="d-flex align-items-center gap-1">
            <input
              ref="titleInputRef"
              v-model="titleDraft"
              type="text"
              class="form-control form-control-sm"
              style="width: 16rem"
              @keydown.enter="saveTitle"
              @keydown.esc="cancelEditingTitle"
            />
            <button
              type="button"
              class="btn btn-sm btn-primary"
              :disabled="savingTitle"
              @click="saveTitle"
            >
              {{ $t('save') }}
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="cancelEditingTitle"
            >
              {{ $t('cancel') }}
            </button>
          </div>
        </template>
        <span v-else class="BaristaModal__conversation is-placeholder">
          {{ $t('newConversation') }}
        </span>
      </div>
      <div class="BaristaModal__headerActions">
        <BaristaIconButton icon="floatingWindow" :label="$t('compact')" @click="emit('compact')" />
        <BaristaIconButton icon="cross" :label="$t('close')" @click="dismiss" />
      </div>
    </template>
    <div class="BaristaModal__layout">
      <section class="BaristaModal__chat">
        <BaristaChat :filters="suggestedFilters" @suggestFilters="handleFiltersChanged" />
      </section>
      <aside class="BaristaModal__side">
        <button
          type="button"
          :disabled="!hasMessages"
          class="btn btn-sm btn-outline-secondary w-100 border border-dark BaristaModal__newChat"
          @click="resetChat"
        >
          <Icon name="plus" :scale="0.7" :stroke-width="1.75" />
          {{ $t('newChat') }}
        </button>
        <div class="BaristaModal__tabs" role="tablist">
          <button
            v-for="tabItem in AvailableTabs"
            :key="tabItem"
            type="button"
            role="tab"
            class="BaristaModal__tab small-caps"
            :class="{ active: tabItem === activeRightTab }"
            :aria-selected="tabItem === activeRightTab"
            @click="activeRightTab = tabItem"
          >
            {{ $t(tabItem) }}
            <span
              v-if="tabItem === 'filters' && visibleSuggestedFilters.length"
              class="BaristaModal__tabCount"
            >
              {{ visibleSuggestedFilters.length }}
            </span>
          </button>
        </div>
        <div
          class="BaristaModal__sideBody"
          :class="{ 'is-scrollable': activeRightTab === 'history' }"
          role="tabpanel"
        >
          <BaristaFiltersTray
            v-if="activeRightTab === 'filters'"
            variant="panel"
            :suggested-filters="suggestedFilters"
            :filters-with-items="suggestedFiltersWithItems"
            :current-filters="props.filters"
            @changed="handleFiltersChanged"
            @apply="handleApplyFilters"
          />
          <BaristaConversations v-else :fetch-items-when-visible="activeRightTab === 'history'" />
        </div>
      </aside>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import type { Filter } from '@/models'
import BaristaFiltersTray from './BaristaFiltersTray.vue'
import BaristaIconButton from './BaristaIconButton.vue'
import BaristaChat from './BaristaChat.vue'
import { computed, nextTick, ref } from 'vue'
import Icon from '@/components/base/Icon.vue'
import { useBaristaStore } from '@/stores/barista'
import BaristaConversations from '@/components/barista/BaristaConversations.vue'
import { useBaristaSuggestedFilters } from '@/composables/useBaristaSuggestedFilters'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
  /** Filters suggested by Barista, kept in sync with the compact view */
  suggestedFilters?: Filter[]
}

const AvailableTabs = ['filters', 'history'] as const
type AvailableTab = (typeof AvailableTabs)[number]

const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: 'modal-dialog-centered modal-dialog-scrollable modal-xl vh-90'
})

const emit = defineEmits<{
  dismiss: []
  compact: []
  applyFilters: [updatedFilters: Filter[]]
  'update:suggestedFilters': [filters: Filter[]]
}>()

const baristaStore = useBaristaStore()
const hasMessages = computed(() => baristaStore.messages.length > 0)
const activeRightTab = ref<AvailableTab>('filters')

const editingTitle = ref(false)
const titleDraft = ref('')
const savingTitle = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)

function startEditingTitle() {
  titleDraft.value = baristaStore.currentConversation?.label ?? ''
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function cancelEditingTitle() {
  editingTitle.value = false
}

async function saveTitle() {
  const conversation = baristaStore.currentConversation
  const label = titleDraft.value.trim()
  if (!conversation || !label) return
  savingTitle.value = true
  try {
    await baristaStore.editConversationTitle(conversation.baristaSessionId, label)
    conversation.label = label
    editingTitle.value = false
  } finally {
    savingTitle.value = false
  }
}

const {
  suggestedFilters,
  visibleSuggestedFilters,
  suggestedFiltersWithItems,
  handleFiltersChanged
} = useBaristaSuggestedFilters({
  filters: () => props.filters,
  suggestedFilters: () => props.suggestedFilters,
  onSuggestedFiltersChange: filters => emit('update:suggestedFilters', filters)
})

const resetChat = () => baristaStore.createNewSession()
const handleApplyFilters = () => emit('applyFilters', suggestedFilters.value)
const dismiss = () => emit('dismiss')
</script>

<i18n lang="json">
{
  "en": {
    "BaristaModalTitle": "Ask Barista",
    "filters": "Search filters",
    "history": "History",
    "newChat": "New chat",
    "compact": "Float over search results",
    "close": "Close",
    "newConversation": "New conversation",
    "click to rename": "Click to rename",
    "save": "Save",
    "cancel": "Cancel"
  }
}
</i18n>
<style lang="css">
.BaristaModal {
  --bs-modal-width: 920px;
}
.BaristaModal .modal-dialog {
  height: min(90dvh, 52rem);
}
.BaristaModal .modal-dialog,
.BaristaModal .modal-content {
  border-radius: var(--border-radius-md);
}
.BaristaModal .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.BaristaModal__headerActions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 0 0 auto;
}
.BaristaModal .modal-header {
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--clr-grey-700);
  padding: 0.9rem 0.75rem 0.85rem 1.25rem;
}
.BaristaModal .modal-dialog-scrollable .modal-body,
.BaristaModal .modal-body,
.BaristaModal__body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.BaristaModal .modal-footer {
  display: none;
}
.BaristaModal__heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1 1 auto;
}
.BaristaModal__kicker {
  margin: 0;
  color: var(--clr-grey-300);
}
.BaristaModal__conversation {
  all: unset;
  cursor: pointer;
  max-width: 36rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.15rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
}
.BaristaModal__conversation:hover {
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.BaristaModal__conversation.is-placeholder {
  cursor: default;
  color: var(--clr-grey-300);
}
.BaristaModal__conversation.is-placeholder:hover {
  text-decoration: none;
}
/* side column wide enough for the 18rem pill dropdowns of BaristaFiltersTray */
.BaristaModal__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 21.5rem;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.BaristaModal__chat {
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 0.35rem 1rem 0.75rem 1.15rem;
}
.BaristaModal__side {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 1rem 1rem 0.75rem;
  border-left: 1px solid var(--clr-grey-700);
  background-color: var(--impresso-color-white);
}
.btn.BaristaModal__newChat:hover:not(:disabled),
.btn.BaristaModal__newChat:active:not(:disabled) {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}
.BaristaModal__newChat svg path {
  stroke: currentColor;
}
.BaristaModal__newChat {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  min-height: 2.25rem;
}
.BaristaModal__tabs {
  display: flex;
  flex: 0 0 auto;
  margin: 1rem -1rem 0;
  padding: 0 1rem;
  border-bottom: 1px solid var(--clr-grey-200);
}
/* same lines as the search tabs (ul.nav.nav-pills in style.css) */
.BaristaModal__tab {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem 0.5rem;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  color: var(--clr-grey-300);
  transition:
    color 0.2s ease,
    box-shadow 0.2s ease;
}
.BaristaModal__tab.active {
  color: var(--impresso-color-black);
  border-bottom-color: var(--clr-grey-200);
  box-shadow: var(--clr-grey-200) 0 2px 0 0;
}
.BaristaModal__tab:hover {
  color: var(--impresso-color-black);
  box-shadow: var(--impresso-color-black) 0 2px 0 0;
}
.BaristaModal__tab:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}
.BaristaModal__tabCount {
  min-width: 1.125rem;
  padding: 0 0.25rem;
  border: 1px solid currentColor;
  border-radius: var(--border-radius-sm);
  font-size: 0.6875rem;
  line-height: 1rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.BaristaModal__sideBody {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding-top: 0.875rem;
}
.BaristaModal__sideBody.is-scrollable {
  overflow-y: auto;
  margin-right: -0.5rem;
  padding-right: 0.5rem;
  scrollbar-gutter: stable;
}
.BaristaModal__sideBody .BaristaConversations {
  max-height: none;
  min-height: 0;
  overflow: visible;
}
@media (max-width: 991.98px) {
  .BaristaModal__layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(9rem, 40%);
  }
  .BaristaModal__side {
    border-left: 0;
    border-top: 1px solid var(--clr-grey-700);
  }
}
</style>
