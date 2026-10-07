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
      </div>
      <button
        type="button"
        class="btn btn-transparent text-dark"
        aria-label="Close"
        @click="dismiss"
      >
        <Icon name="cross" color />
      </button>
    </template>
    <div class="BaristaModal__layout" ref="containerRef">
      <section class="BaristaModal__chat">
        <BaristaChat
          :filters="suggestedFilters"
          @suggestFilters="handleFiltersChanged"
          @updateHeight="handleUpdateHeight"
        >
        </BaristaChat>
      </section>
      <aside class="BaristaModal__side">
        <button
          type="button"
          :disabled="!hasMessages"
          class="btn btn-outline-secondary btn-md w-100 border border-dark BaristaModal__newChat"
          @click="resetChat"
        >
          <Icon name="edit" :scale="0.7" :stroke-width="1.75" />
          {{ $t('newChat') }}
        </button>
        <div class="BaristaModal__tabs">
          <b-tabs pills>
            <template v-slot:tabs-end>
              <b-nav-item v-for="(tabItem, i) in AvailableTabs" :key="i" class="w-50">
                <button
                  type="button"
                  class="border-0 small-caps nav-link w-100 cursor-pointer text-center"
                  :class="{ active: tabItem === activeRightTab }"
                  @click="activeRightTab = tabItem"
                >
                  {{ $t(tabItem) }}
                </button>
              </b-nav-item>
            </template>
          </b-tabs>
        </div>
        <div class="BaristaModal__sideBody">
          <template v-if="activeRightTab === 'overview'">
            <section class="BaristaModal__blurb">
              <Ellipsis :initialHeight="70">
                <p>
                  Barista [ba’rista] is the person behind the counter in a coffee shop: they listen
                  carefully to your order, your hesitations, and sometimes even your worries. Of
                  course they don’t have the answer you need, but they help you figure it out, and
                  then prepare a proper coffee in the meanwhile, to clear your mind. Don’t worry,
                  they’re the ultimate local expert: they suggest the connections that matter for
                  your problem, and help you understand the neighbourhood, without ever leaving the
                  counter.
                </p>
              </Ellipsis>
            </section>
            <BFormCheckbox switch v-model="baristaStore.sendCurrentFilters" class="mb-2">
              Share current search filters with Barista
            </BFormCheckbox>
            <section v-if="baristaStore.sendCurrentFilters">
              <p class="text-muted small mb-2">
                These filters are shared between you and Barista :)
              </p>

              <SearchPills
                :right-aligned="true"
                :filters="suggestedFiltersWithItems"
                @changed="handleFiltersChanged"
              />
              <button
                class="btn btn-outline-secondary btn-md w-100 mt-3 border border-dark"
                @click="handleApplyFilters"
              >
                Apply Filters to current search
              </button>
            </section>
          </template>
          <BaristaConversations
            v-else
            :fetch-items-when-visible="activeRightTab === 'conversations'"
          />
        </div>
      </aside>
    </div>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">
        {{ $t('close') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import SearchPills from '../SearchPills.vue'
import type { Filter } from '@/models'
import BaristaChat from './BaristaChat.vue'
import { computed, nextTick, ref, watch } from 'vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import Icon from '../base/Icon.vue'
import { useBaristaStore } from '@/stores/barista'
import BaristaConversations from '@/components/barista/BaristaConversations.vue'
import Ellipsis from '../modules/Ellipsis.vue'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
}

const AvailableTabs = ['overview', 'conversations'] as const
type AvailableTab = (typeof AvailableTabs)[number]

const containerRef = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: ' modal-dialog-centered  modal-dialog-scrollable modal-xl vh-90'
})
const baristaStore = useBaristaStore()
const activeRightTab = ref<AvailableTab>('overview')

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
  const conv = baristaStore.currentConversation
  if (!conv || !titleDraft.value.trim()) return
  savingTitle.value = true
  try {
    await baristaStore.editConversationTitle(conv.baristaSessionId, titleDraft.value.trim())
    conv.label = titleDraft.value.trim()
    editingTitle.value = false
  } finally {
    savingTitle.value = false
  }
}

const resetChat = () => {
  console.debug('[BaristaModal] Reset chat requested')
  baristaStore.createNewSession()
}
const hasMessages = computed(() => baristaStore.messages.length > 0)
const handleUpdateHeight = (height: number) => {
  console.debug('[BaristaModal] Height update requested:', height)
  const scrollableModalBody = containerRef.value?.parentElement

  if (scrollableModalBody) {
    scrollableModalBody.scrollTo({
      top: height,
      behavior: 'smooth'
    })
  }
}
const emit = defineEmits<{
  dismiss: []
  applyFilters: [updatedFilters: Filter[]]
}>()

const suggestedFilters = ref<Filter[]>(props.filters || [])
const suggestedFiltersWithItems = ref<Filter[]>([])

watch(
  () => suggestedFilters.value,
  async newFilters => {
    suggestedFiltersWithItems.value = await filterItemsService
      .find({
        query: {
          filters: serializeFilters(newFilters)
        }
      })
      .then(joinFiltersWithItems)
  },
  { immediate: true }
)

watch(
  () => props.filters,
  newFilters => {
    suggestedFilters.value = [...newFilters]
  },
  { immediate: true }
)

watch(
  () => baristaStore.sendCurrentFilters,
  value => {
    console.debug('[BaristaModal] Detected change in sendCurrentFilters:', value)
    if (value) {
      suggestedFilters.value = props.filters || []
    } else {
      suggestedFilters.value = []
    }
  }
)

const handleFiltersChanged = (updatedFilters: Filter[]) => {
  suggestedFilters.value = updatedFilters
}

const handleApplyFilters = () => {
  console.debug('[BaristaModal] @handleApplyFilters')
  emit('applyFilters', suggestedFilters.value)
}

function dismiss() {
  emit('dismiss')
}
</script>

<i18n lang="json">
{
  "en": {
    "baristaTitle": "Ask Barista",
    "BaristaModalTitle": "Ask Barista",
    "overview": "Overview",
    "conversations": "Conversations",
    "newChat": "New chat",
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
.BaristaModal .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
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
.BaristaModal__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
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
  padding: 0.85rem 1rem 1rem;
  border-left: 1px solid var(--clr-grey-700);
  background-color: var(--impresso-color-paper);
}
.BaristaModal__newChat {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex: 0 0 auto;
}
.BaristaModal__tabs {
  flex: 0 0 auto;
  margin-top: 0.85rem;
  background-color: var(--impresso-color-paper);
}
.BaristaModal__sideBody {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-top: 0.85rem;
}
.BaristaModal__blurb {
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--clr-grey-700);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--clr-grey-200);
}
.BaristaModal__sideBody .BaristaConversations {
  max-height: none;
  min-height: 0;
}
@media (max-width: 991.98px) {
  .BaristaModal__layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(9rem, 36%);
  }
  .BaristaModal__side {
    border-left: 0;
    border-top: 1px solid var(--clr-grey-700);
  }
}
</style>
