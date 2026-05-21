<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClass="BaristaModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0 mt-2 mx-3 border-top"
    @close="dismiss"
    hide-footer
  >
    <template v-slot:modal-header>
      <div class="d-flex align-items-center gap-2">
        <h5 class="modal-title">{{ $t('BaristaModalTitle') }}</h5>
        <button
          type="button"
          :disabled="!hasMessages"
          class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          @click="resetChat"
        >
          {{ $t('new chat') }}
          <Icon name="dots" class="ms-1" :scale="0.25" :stroke-width="5" />
        </button>
        <div class="dropdown" ref="conversationsDropdownRef">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            @click="toggleConversationsDropdown"
          >
            {{ $t('conversations') }}
            <Icon name="chevron-down" :scale="0.6" />
          </button>
          <ul
            v-if="conversationsDropdownOpen"
            class="dropdown-menu show shadow-sm"
            style="max-height: 300px; overflow-y: auto; min-width: 220px"
          >
            <li v-if="conversationsLoading" class="dropdown-item text-muted small">
              {{ $t('loading') }}…
            </li>
            <li v-else-if="!conversations.length" class="dropdown-item text-muted small">
              {{ $t('no conversations') }}
            </li>
            <li v-for="conv in conversations" :key="conv.baristaSessionId">
              <button
                type="button"
                class="dropdown-item small d-flex flex-column align-items-start"
                @click="selectConversation(conv.baristaSessionId)"
              >
                <span class="text-truncate" style="max-width: 240px">{{ conv.label }}</span>
                <span class="text-muted" style="font-size: 0.75em">{{ relativeTime(conv.dateLastModified) }}</span>
              </button>
            </li>
          </ul>
        </div>
        <template v-if="baristaStore.currentConversation">
          <span
            v-if="!editingTitle"
            class="small text-muted text-truncate"
            style="max-width: 200px; cursor: pointer"
            :title="$t('click to rename')"
            @click="startEditingTitle"
            >{{ baristaStore.currentConversation.label }}</span
          >
          <div v-else class="d-flex align-items-center gap-1">
            <input
              ref="titleInputRef"
              v-model="titleDraft"
              type="text"
              class="form-control form-control-sm"
              style="width: 180px"
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
    <div class="container-fluid" ref="containerRef">
      <div class="row mb-3">
        <div class="col-lg-8 py-2 order-md-2 order-lg-1">
          <BaristaChat
            :filters="suggestedFilters"
            @suggestFilters="handleFiltersChanged"
            @updateHeight="handleUpdateHeight"
          >
          </BaristaChat>
        </div>
        <div class="col-lg-4 py-2 order-md-1 order-lg-2">
          <p class="pt-3 border-bottom pb-2 small">
            Barista [ba’rista] is the person behind the counter in a coffee shop: they listen
            carefully to your order, your hesitations, and sometimes even your worries. Of course
            they don’t have the answer you need, but they help you figure it out, and then prepare a
            proper coffee in the meanwhile, to clear your mind. Don’t worry, they’re the ultimate
            local expert: they suggest the connections that matter for your problem, and help you
            understand the neighbourhood, without ever leaving the counter.
          </p>
          <div class="position-sticky top-0 bg-white py-2" v-if="suggestedFilters.length">
            <p v-if="baristaStore.sendCurrentFilters">
              These filters are shared between you and Barista :)
            </p>
            <p v-else>These filters are suggested by Barista for your current search:</p>
            <SearchPills :filters="suggestedFiltersWithItems" @changed="handleFiltersChanged" />
            <button class="btn btn-outline-primary w-100 mt-3" @click="handleApplyFilters">
              Apply Filters to current search
            </button>
          </div>
        </div>
      </div>
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
import type { Filter } from 'impresso-jscommons'
import BaristaChat from './BaristaChat.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters, toCanonicalFilter } from '@/logic/filters'
import type { BaristaConversation } from '@/services/types/baristaConversations'
import { relativeTime } from '@/util/time'
import Icon from '../base/Icon.vue'
import { useBaristaStore } from '@/stores/barista'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
}
const containerRef = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: ' modal-dialog-centered  modal-dialog-scrollable modal-xl vh-90'
})
const baristaStore = useBaristaStore()


const conversations = ref<BaristaConversation[]>([])
const conversationsLoading = ref(false)
const conversationsDropdownOpen = ref(false)
const conversationsDropdownRef = ref<HTMLElement | null>(null)

async function toggleConversationsDropdown() {
  conversationsDropdownOpen.value = !conversationsDropdownOpen.value
  if (conversationsDropdownOpen.value) {
    conversationsLoading.value = true
    try {
      const result = await baristaStore.getConversations()
      conversations.value = result.data
    } finally {
      conversationsLoading.value = false
    }
  }
}

async function selectConversation(sessionId: string) {
  conversationsDropdownOpen.value = false
  await baristaStore.loadConversation(sessionId)
}

function handleClickOutside(event: MouseEvent) {
  if (
    conversationsDropdownRef.value &&
    !conversationsDropdownRef.value.contains(event.target as Node)
  ) {
    conversationsDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

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
    "conversations": "Conversations",
    "no conversations": "No conversations yet",
    "loading": "Loading",
    "click to rename": "Click to rename",
    "save": "Save",
    "cancel": "Cancel"
  }
}
</i18n>
<style lang="css">
.BaristaModal {
  --bs-modal-width: 800px;
}
.BaristaModal .modal-header {
  border-bottom: none;
  padding-right: var(--spacing-1);
  padding-bottom: var(--spacing-1);
}

.BaristaModal .modal-footer {
  border-top: none;
  padding-right: var(--spacing-2);
  padding-bottom: var(--spacing-2);
}
</style>
