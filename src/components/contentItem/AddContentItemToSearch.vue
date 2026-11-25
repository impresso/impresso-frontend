<template>
  <button
    type="button"
    class="btn btn-sm btn-outline-secondary"
    :disabled="props.disabled"
    data-testid="add-content-item-to-search-button"
    :title="props.disabled ? props.disabledReason : undefined"
    @click="openModal"
  >
    <slot>{{ $t('addToSearch') }}</slot>
  </button>

  <Teleport to="body">
    <Modal
      :show="isModalOpen"
      :title="$t('addToSearch')"
      dialogClass="modal-md modal-dialog-centered"
      @close="closeModal"
    >
      <template v-if="!errorKey">
        <p class="mb-0" data-testid="embedding-generation-message">
          {{ $t(isSubmitting ? 'generatingSearchFilter' : 'confirmAddToSearch') }}
        </p>

        <Alert type="info" class="mt-3 mb-0">
          {{ $t('searchDurationNote') }}
        </Alert>
      </template>

      <Alert v-else type="error" class="border-danger" role="alert">
        {{ $t(errorKey) }}
      </Alert>

      <template #modal-footer="{ close }">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="isSubmitting"
          @click="close()"
        >
          {{ $t('cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
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
          <span>{{ $t(isLoading ? 'preparing' : canRetry ? 'retry' : 'confirm') }}</span>
        </button>
      </template>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import { contentItems } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import type { Filter } from '@/models'
import { deserializeFilters, optimizeFilters, serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { useSearchQueriesStore } from '@/stores/searchQueries'

export interface AddContentItemToSearchProps {
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

const props = defineProps<AddContentItemToSearchProps>()
const router = useRouter()
const searchQueriesStore = useSearchQueriesStore()

const isModalOpen = ref(false)
const isFetchingEmbedding = ref(false)
const isSubmitting = ref(false)
const errorKey = ref<ErrorKey | null>(null)
const fetchedEmbedding = ref<string | null>(null)

const isLoading = computed(() => isFetchingEmbedding.value || isSubmitting.value)
const embedding = computed(() => props.embedding || fetchedEmbedding.value)
const canRetry = computed(() => errorKey.value !== null && !embedding.value)

// Incremented on every fetch and on close, so late responses from a
// previous/closed modal session are ignored.
let requestId = 0

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

function openModal() {
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
    const currentFilters = deserializeFilters(searchQueriesStore.latest?.hash).filter(
      filter => filter.type !== 'embedding'
    )
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
    "addToSearch": "Add to current search",
    "confirmAddToSearch": "Add this item as a similarity filter to your active search to find related content.",
    "generatingSearchFilter": "Preparing similarity filter and opening Search…",
    "searchDurationNote": "Loading the matching results may take a few seconds, depending on the complexity of your active filters.",
    "noEmbeddingAvailable": "No semantic embedding is available for this content item.",
    "embeddingFetchFailed": "The semantic embedding could not be loaded. Please try again.",
    "embeddingFilterNotAllowed": "Additional filters cannot contain an embedding filter.",
    "searchFailed": "The search could not be opened. Please try again.",
    "cancel": "Cancel",
    "confirm": "Confirm and search",
    "retry": "Retry",
    "preparing": "Preparing…"
  }
}
</i18n>
