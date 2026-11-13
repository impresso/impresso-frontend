<template>
  <button
    type="button"
    class="btn btn-sm btn-outline-primary"
    :disabled="isLoading"
    data-testid="add-content-item-to-search-button"
    @click="addContentItemToSearch"
  >
    {{ $t('addToSearch') }}
  </button>

  <Teleport to="body">
    <Modal
      :show="isModalOpen"
      :title="$t('addToSearch')"
      dialogClass="modal-sm modal-dialog-centered"
      hide-footer
      @close="isModalOpen = false"
    >
      <p v-if="!error" class="mb-0" data-testid="embedding-generation-message">
        {{ $t('generatingSearchFilter') }}
      </p>
      <p v-else class="alert alert-danger mb-0" role="alert">{{ error }}</p>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { contentItems } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import { deserializeFilters, optimizeFilters, serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { useSearchQueriesStore } from '@/stores/searchQueries'

export interface AddContentItemToSearchProps {
  contentItemId: string
}

const props = defineProps<AddContentItemToSearchProps>()
const router = useRouter()
const searchQueriesStore = useSearchQueriesStore()
const isModalOpen = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

async function addContentItemToSearch() {
  if (isLoading.value) return

  isModalOpen.value = true
  isLoading.value = true
  error.value = null

  try {
    const contentItem = await contentItems.get(props.contentItemId, {
      query: { include_embeddings: true }
    })
    const embedding = contentItem.semanticEnrichments?.embeddings?.[0]

    if (!embedding) {
      throw new Error('No semantic embedding is available for this content item.')
    }

    // A similarity search can use only one content-item vector. Replace any
    // prior embedding filter rather than merging its vector with this one.
    const currentFilters = deserializeFilters(searchQueriesStore.latest?.hash).filter(
      filter => filter.type !== 'embedding'
    )
    const filters = optimizeFilters([
      ...currentFilters,
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
    "generatingSearchFilter": "generating search filter from content item"
  }
}
</i18n>
