<template>
  <Modal
    :title="title"
    :show="show"
    @close="emit('dismiss')"
    hide-footer
    dialog-class="modal-dialog-centered"
  >
    <CreateCollectionForm
      @submit="createQueryCollection"
      :autofocus="show"
      :initial-payload="initialPayload"
      :is-loading="isLoading"
    >
      <template #form-errors>
        <Alert v-if="error" type="warning" class="mb-3 p-3" role="alert">
          <p class="m-0" v-if="error.code === 500">
            An unexpected error occurred while creating the collection. Please try again later.
          </p>
          <p class="m-0" v-else-if="error.code === 409">
            A collection with this name already exists. Please choose a different name.
          </p>
          <p class="m-0" v-else-if="error.code === 501">
            A collection creation is already in progress. Please complete or cancel it before
            starting a new one.
            <br />
            If this message continues to appear or you're unable to proceed, please contact us —
            we're happy to assist.
          </p>
          <p class="m-0" v-else>{{ error.message }} ({{ error.code }})</p>
        </Alert>
      </template>
    </CreateCollectionForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CreateCollectionForm from 'impresso-ui-components/components/CreateCollectionForm.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import type { FeathersError } from '@feathersjs/errors'
import {
  collections as collectionsService,
  collectionsItems as collectionsItemsService
} from '@/services'
import type Collection from '@/models/Collection'

const isLoading = ref(true)
const error = ref<FeathersError | null>(null)
const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'success', collection: Collection): void
}>()
export interface Props {
  show?: boolean
  title?: string
  submitLabel?: string
  filters?: any[]
  initialPayload?: {
    name: string
    description: string
  }
}
/**
 * CreateCollectionModal - Modal dialog for creating a new collection
 *
 * This component provides a modal interface to create a new collection with a name and description.
 *
 * **IMPORTANT**: If the `filters` prop is provided, the collection will be automatically populated
 * with content items matching those filters upon creation. This can add a significant number of items
 * to the collection depending on the filter criteria.
 *
 * @example
 * ```vue
 * <CreateCollectionModal
 *   :show="showModal"
 *   title="Create New Collection"
 *   :filters="[]"
 *   @dismiss="showModal = false"
 *   @success="handleCollectionCreated"
 *   :initial-payload="{ name: 'My Collection', description: 'Description here' }"
 * />
 * ```
 */
const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: 'Create Collection',
  submitLabel: 'Create',
  filters: () => []
})

async function createQueryCollection({ name, description }) {
  isLoading.value = true
  const collection = await collectionsService
    .create({
      name,
      description
    })
    .catch((err: FeathersError) => {
      error.value = err
    })

  if (!collection) {
    // edd simple error handling
    isLoading.value = false
    return
  }
  if (!props.filters || props.filters.length === 0) {
    emit('success', collection)
    isLoading.value = false
    return
  }
  try {
    await collectionsItemsService.create(
      {
        namespace: 'search',
        filters: props.filters
      },
      {
        route: { collection_id: collection.uid }
      }
    )
    emit('success', collection)
  } catch (err) {
    error.value = err
    console.error('Error initializing collection items:', err)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.show,
  newValue => {
    if (newValue) {
      isLoading.value = false
      error.value = null
    }
  }
)
</script>
