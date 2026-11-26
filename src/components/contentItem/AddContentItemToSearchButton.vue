<template>
  <div class="AddContentItemToSearchButton">
    <button
      v-if="props.disabled"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      disabled
      data-testid="add-content-item-to-search-button"
      :title="props.disabledReason"
    >
      <slot>
        {{ $t('useInSearch') }}
        <Icon name="brainElectricity" class="ml-1" :scale="0.75" :stroke-width="1.5" />
      </slot>
    </button>
    <BDropdown
      v-else
      right
      class="position-relative"
      size="sm"
      variant="outline-secondary"
      data-testid="add-content-item-to-search-button"
    >
      <template #button-content>
        <slot>
          {{ $t('useInSearch') }}
          <Icon name="brainElectricity" class="ml-1" :scale="0.75" :stroke-width="1.5" />
        </slot>
      </template>
      <BDropdownItem
        v-if="currentSearch"
        data-testid="replace-search-item"
        @click="openModal('replace')"
      >
        {{ $t('replaceSearch') }}
      </BDropdownItem>
      <BDropdownItem data-testid="add-search-item" @click="openModal('add')">
        {{ $t('addToCurrentSearch') }}
      </BDropdownItem>
    </BDropdown>

    <Teleport to="body">
      <Modal
        :show="isModalOpen"
        :title="$t('useInSearch')"
        dialogClass="modal-md modal-dialog-centered"
        @close="closeModal"
      >
        <template v-if="!errorKey">
          <p class="mb-0" data-testid="embedding-generation-message">
            {{ $t(isSubmitting ? 'generatingSearchFilter' : confirmationMessageKey) }}
          </p>

          <div
            v-if="currentSearchFilters.length"
            class="mt-3 bg-light p-2 shadow-sm rounded border"
          >
            <strong>{{ $t('currentSearchFilters') }}</strong>
            {{ currentSearch.summary }}
          </div>

          <Alert type="info" class="mt-3 mb-0">
            {{ $t('searchDurationNote') }}
          </Alert>
        </template>

        <Alert v-else type="error" class="border-danger" role="alert">
          {{ $t(errorKey) }}
        </Alert>

        <template #modal-footer>
          <button
            ref="confirmButton"
            type="button"
            class="m-2 btn btn-outline-secondary btn-md px-4 border border-dark d-inline-flex align-items-center gap-2"
            data-testid="confirm-add-content-item-to-search-button"
            :disabled="isLoading"
            @click="addContentItemToSearch"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            <span>{{ $t(confirmButtonLabelKey) }}</span>
            <Icon name="brainElectricity" :scale="0.75" :stroke-width="1.5" />
          </button>
        </template>
      </Modal>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Icon from '@/components/base/Icon.vue'
import BDropdown from '@/components/legacy/bootstrap/BDropdown.vue'
import BDropdownItem from '@/components/legacy/bootstrap/BDropdownItem.vue'
import { contentItems } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import type { Filter } from '@/models'
import { deserializeFilters, optimizeFilters, serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { useSearchQueriesStore } from '@/stores/searchQueries'

export interface AddContentItemToSearchButtonProps {
  contentItemId: string
  embedding?: string
  disabled?: boolean
  disabledReason?: string
  /** Additional search filters, merged with the current search. Must not contain an embedding. */
  additionalFilters?: Filter[]
}

/** Keys of the i18n messages shown in the error alert (t() is only available in the template). */
type ErrorKey =
  'noEmbeddingAvailable' | 'embeddingFetchFailed' | 'embeddingFilterNotAllowed' | 'searchFailed'

const props = defineProps<AddContentItemToSearchButtonProps>()
const router = useRouter()
const searchQueriesStore = useSearchQueriesStore()
const currentSearch = computed(() => searchQueriesStore.latest)
const currentSearchFilters = computed(() => deserializeFilters(currentSearch.value?.hash))

type SearchMode = 'replace' | 'add'

const mode = ref<SearchMode>('add')
const confirmationMessageKey = computed(() =>
  mode.value === 'replace' ? 'confirmReplaceSearch' : 'confirmAddToSearch'
)
const isModalOpen = ref(false)
const confirmButton = ref<HTMLButtonElement | null>(null)
const isFetchingEmbedding = ref(false)
const isSubmitting = ref(false)
const errorKey = ref<ErrorKey | null>(null)
const fetchedEmbedding = ref<string | null>(null)

const isLoading = computed(() => isFetchingEmbedding.value || isSubmitting.value)
const embedding = computed(() => props.embedding || fetchedEmbedding.value)
const canRetry = computed(() => errorKey.value !== null && !embedding.value)
const confirmButtonLabelKey = computed(() => {
  if (isLoading.value) return 'preparing'
  if (canRetry.value) return 'retry'
  return mode.value === 'replace' ? 'replaceSearch' : 'addToCurrentSearch'
})

// Incremented on every fetch and on close, so late responses from a
// previous/closed modal session are ignored.
let requestId = 0

watch(
  confirmButton,
  button => {
    const dialog = button?.closest<HTMLElement>('[role="dialog"]')
    if (!isModalOpen.value || !button || !dialog || dialog.contains(document.activeElement)) return
    if (button.disabled) dialog.focus()
    else button.focus()
  },
  { flush: 'post' }
)

watch(
  isLoading,
  loading => {
    const button = confirmButton.value
    if (
      !loading &&
      isModalOpen.value &&
      button?.closest('[role="dialog"]') === document.activeElement
    ) {
      button.focus()
    }
  },
  { flush: 'post' }
)

async function loadEmbedding() {
  const currentRequest = ++requestId
  errorKey.value = null
  fetchedEmbedding.value = null
  isFetchingEmbedding.value = true

  try {
    const contentItem = await contentItems.get(props.contentItemId, {
      query: { include_embeddings: true }
    })
    if (currentRequest !== requestId) return

    const result = contentItem.semanticEnrichments?.embeddings?.[0]
    if (result) {
      fetchedEmbedding.value = result
    } else {
      errorKey.value = 'noEmbeddingAvailable'
    }
  } catch (reason: unknown) {
    if (currentRequest !== requestId) return
    console.error(reason)
    errorKey.value = 'embeddingFetchFailed'
  } finally {
    if (currentRequest === requestId) isFetchingEmbedding.value = false
  }
}

function openModal(selectedMode: SearchMode) {
  mode.value = selectedMode
  errorKey.value = null
  isModalOpen.value = true
  // Start fetching right away, unless the embedding was provided by the parent.
  if (!props.embedding) loadEmbedding()
}

function closeModal() {
  if (isSubmitting.value) return
  requestId++ // invalidate any in-flight fetch
  isFetchingEmbedding.value = false
  isModalOpen.value = false
}

async function addContentItemToSearch() {
  if (isLoading.value) return

  // The fetch failed or returned nothing: this click is a retry.
  if (!embedding.value) {
    await loadEmbedding()
    return
  }

  isSubmitting.value = true
  errorKey.value = null

  try {
    if (props.additionalFilters?.some(filter => filter.type === 'embedding')) {
      errorKey.value = 'embeddingFilterNotAllowed'
      return
    }

    // A similarity search can use only one content-item vector. Replace any
    // prior embedding filter rather than merging its vector with this one.
    // In "replace" mode the current search is discarded altogether.
    const currentFilters =
      mode.value === 'add'
        ? currentSearchFilters.value.filter(filter => filter.type !== 'embedding')
        : []
    const filters = optimizeFilters([
      ...currentFilters,
      ...(props.additionalFilters ?? []),
      FilterFactory.create({ type: 'embedding', q: [embedding.value] })
    ])

    await router.push({
      name: 'search',
      query: { [CommonQueryParameters.SearchFilters]: serializeFilters(filters) }
    })
    isModalOpen.value = false
  } catch (reason: unknown) {
    console.error(reason)
    errorKey.value = 'searchFailed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "useInSearch": "Use this item",
    "replaceSearch": "Replace your current search",
    "currentSearchFilters": "Current search filters:",
    "addToCurrentSearch": "Add to your current search",
    "confirmReplaceSearch": "Start a new search for items similar to this one. Your current search filters will be cleared.",
    "confirmAddToSearch": "Find similar items within your current search. If you already use an item as a similarity filter, this one will replace it. Your other filters will stay in place.",
    "generatingSearchFilter": "Preparing similarity filter and opening Search…",
    "searchDurationNote": "Loading the matching results may take a few seconds, depending on the complexity of your active filters.",
    "noEmbeddingAvailable": "No semantic embedding is available for this content item.",
    "embeddingFetchFailed": "The semantic embedding could not be loaded. Please try again.",
    "embeddingFilterNotAllowed": "Additional filters cannot contain an embedding filter.",
    "searchFailed": "The search could not be opened. Please try again.",
    "cancel": "Cancel",
    "retry": "Retry",
    "preparing": "Preparing…"
  }
}
</i18n>
