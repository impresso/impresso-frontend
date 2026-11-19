<template>
  <button
    type="button"
    class="btn btn-sm btn-outline-primary"
    :disabled="props.disabled || isLoading"
    data-testid="add-content-item-to-search-button"
    :title="props.disabled || isLoading ? props.disabledReason : undefined"
    @click="openModal"
  >
    <slot>{{ $t('addToSearch') }}</slot>
  </button>

  <Teleport to="body">
    <Modal
      :show="isModalOpen"
      :title="$t('addToSearch')"
      dialogClass="modal-md modal-dialog-centered"
      @close="!isLoading && (isModalOpen = false)"
    >
      <template v-if="!error">
        <p class="mb-0" data-testid="embedding-generation-message">
          {{ $t(isLoading ? 'generatingSearchFilter' : 'confirmAddToSearch') }}
        </p>

        <Alert type="info" class="mt-3 mb-0">
          {{ $t('searchDurationNote') }}
        </Alert>
      </template>

      <p v-else class="alert alert-danger mb-0" role="alert">
        {{ error }}
      </p>

      <template #modal-footer="{ close }">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="isLoading"
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
          <span>{{ $t(isLoading ? 'preparing' : 'confirm') }}</span>
        </button>
      </template>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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

const props = defineProps<AddContentItemToSearchProps>()
const router = useRouter()
const { t } = useI18n()
const searchQueriesStore = useSearchQueriesStore()

const isModalOpen = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

function openModal() {
  error.value = null
  isModalOpen.value = true
}

async function addContentItemToSearch() {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    if (props.additionalFilters?.some(filter => filter.type === 'embedding')) {
      throw new Error('Additional filters cannot contain an embedding filter.')
    }

    let embedding = props.embedding
    if (embedding === undefined) {
      const contentItem = await contentItems.get(props.contentItemId, {
        query: { include_embeddings: true }
      })
      embedding = contentItem.semanticEnrichments?.embeddings?.[0]
    }

    if (!embedding) {
      throw new Error(t('noEmbeddingAvailable'))
    }

    // A similarity search can use only one content-item vector. Replace any
    // prior embedding filter rather than merging its vector with this one.
    const currentFilters = deserializeFilters(searchQueriesStore.latest?.hash).filter(
      filter => filter.type !== 'embedding'
    )
    const filters = optimizeFilters([
      ...currentFilters,
      ...(props.additionalFilters ?? []),
      FilterFactory.create({ type: 'embedding', q: [embedding] })
    ])

    await router.push({
      name: 'search',
      query: { [CommonQueryParameters.SearchFilters]: serializeFilters(filters) }
    })
    isModalOpen.value = false
  } catch (reason: unknown) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    isLoading.value = false
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
    "cancel": "Cancel",
    "confirm": "Confirm and search",
    "preparing": "Preparing…"
  }
}
</i18n>
