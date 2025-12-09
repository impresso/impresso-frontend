<template>
  <Modal
    :show="isVisible"
    :title="$t(`components.entitySuggester.${type}`)"
    modalClass="EntitySuggester"
    dialogClass="modal-dialog-scrollable modal-md"
    @close="emit('dismiss')"
  >
    <template v-slot:modal-header-extra>
      <form @submit.prevent="performEntitySearch">
        <div class="input-group input-group-sm sans px-3 pb-3 border-bottom">
          <b-form-input
            ref="suggestionQueryRef"
            v-model.trim="suggestionQuery"
            placeholder="search collections ..."
            :debounce="500"
            :autofocus="true"
          />
          <div class="input-group-append">
            <button
              class="btn btn-outline-secondary small btn-sm"
              @click="performEntitySearch"
              :disabled="isLoading"
            >
              {{ $t(isLoading ? 'actions.loading' : 'actions.search') }}
            </button>
          </div>
        </div>
      </form>
    </template>
    <div class="entity-suggester">
      <div class="small">
        <span v-if="isLoading">{{ $t('actions.loading') }}</span>
        <span
          v-else-if="suggestionQuery.length && !isLoading"
          v-html="
            $tc(`numbers.entities`, paginationTotalRows, {
              searchQuery: suggestionQuery,
              count: $n(paginationTotalRows)
            })
          "
        />
        <span v-else-if="!suggestionQuery.length">
          {{ $t('components.entitySuggester.pleaseEnterSearchTerm') }}
        </span>
      </div>
      <LoadingBlock v-if="isLoading" :height="100" />
      <div class="d-flex flex-wrap gap-2 my-2" v-else>
        <div
          class="item-label-wrapper border border-tertiary rounded-sm px-2"
          v-for="(item, i) in items"
          :key="i"
          @click="toggleSelectedItem(item)"
          :class="{ active: selectedItemsIds.includes(item.uid) }"
        >
          <ItemLabel :item="item" :type="type" />
        </div>
      </div>
      <div
        v-if="paginationTotalRows > paginationPerPage"
        class="position-sticky bottom-0 bg-white pt-2 d-flex align-items-center justify-content-center"
      >
        <Pagination
          :current-page="paginationCurrentPage"
          @change="onPaginationChange"
          :total-rows="paginationTotalRows"
          :per-page="paginationPerPage"
          size="sm"
        />
      </div>
    </div>
    <template v-slot:modal-footer="{ close }">
      <b-button
        v-if="numberOfChangesInFilterItems.hasChanged"
        size="sm"
        variant="primary"
        @click="
          () => {
            applyChanges()
            close()
          }
        "
        >{{
          $t('actions.applyChangesDetailedAddedOnly', {
            added: numberOfChangesInFilterItems.addeditems
          })
        }}</b-button
      >
      <b-button @click="close()" size="sm" variant="outline-primary">{{
        $t('actions.discard')
      }}</b-button>
    </template>
  </Modal>
</template>
<i18n lang="json">
{
  "en": {
    "components": {
      "entitySuggester": {
        "title": "Suggest Entities",
        "pleaseEnterSearchTerm": "Please enter a search term",
        "person": "Add entity to Person filter",
        "organization": "Add entity to Organization filter",
        "location": "Add entity to Location filter",
        "nag": "Add entity to Newsagency filter"
      }
    },
    "actions": {
      "create": "Create"
    },
    "numbers": {
      "entities": "Found <span class='number'>{count}</span> entities for '<span class='highlight'>{searchQuery}</span>'|Found <span class='number'>{count}</span> entities for <span class='highlight'>{searchQuery}</span>"
    }
  }
}
</i18n>
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Entity from '@/models/Entity'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import { entities as entitiesService } from '@/services'
import Pagination from '../modules/Pagination.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import type { FacetType } from '@/models/Facet'
import LoadingBlock from '@/components/LoadingBlock.vue'
import type { Filter } from '@/models'

interface FilterItem {
  uid: string
  name: string
}

export interface EntitySuggesterProps {
  filter: Filter
  type: FacetType
  isVisible: boolean
}

const props = defineProps<EntitySuggesterProps>()
const emit = defineEmits<{
  (e: 'filter-changed', value: Filter): void
  (e: 'dismiss'): void
}>()

// Reactive state
const suggestionQuery = ref('')
const paginationPerPage = ref(10)
const paginationCurrentPage = ref(1)
const paginationTotalRows = ref(0)
const items = ref<Entity[]>([])
const selectedItems = ref<FilterItem[]>([])
const isLoading = ref(false)

const suggestionQueryRef = ref<HTMLInputElement | null>(null)

// Computed properties
const filterItemsIds = computed(() => {
  const filterItems = props.filter?.items ?? []
  return filterItems.map(({ uid }) => uid)
})

const selectedItemsIds = computed(() => {
  return selectedItems.value.map(({ uid }) => uid).concat(filterItemsIds.value)
})

const numberOfChangesInFilterItems = computed<{
  addeditems: number
  removedItems: number
  hasChanged: boolean
}>(() => {
  // defference between selected items and filter items
  const existingIds = filterItemsIds.value
  const selectedIds = selectedItemsIds.value
  const addedItems = selectedIds.filter(id => !existingIds.includes(id))
  const removedItems = existingIds.filter(id => !selectedIds.includes(id))
  return {
    addeditems: addedItems.length,
    removedItems: removedItems.length,
    hasChanged: addedItems.length + removedItems.length > 0
  }
})

const onPaginationChange = (newPage: number) => {
  paginationCurrentPage.value = newPage
  items.value = []
  fetchEntities()
}

const performEntitySearch = () => {
  paginationCurrentPage.value = 1
  items.value = []
  fetchEntities()
}

const applyChanges = () => {
  emit('filter-changed', {
    ...props.filter,
    items: selectedItems.value,
    q: selectedItemsIds.value
  })
  emit('dismiss')
}
// Methods
const fetchEntities = async () => {
  const query: any = {
    offset: (paginationCurrentPage.value - 1) * paginationPerPage.value,
    limit: paginationPerPage.value,
    term: suggestionQuery.value,
    filters: [{ type: 'type', q: props.type }]
  }

  items.value = []
  paginationTotalRows.value = 0

  if (suggestionQuery.value.length) {
    query.q = suggestionQuery.value
    isLoading.value = true
    console.info('EntitySuggester: Fetching entities with query', query)
    const { data, total } = await entitiesService.find({ query }).catch(err => {
      console.error('EntitySuggester: Error fetching entities', err)
      return { data: [], total: 0 }
    })
    console.info('EntitySuggester: Fetched entities', data, total)
    paginationTotalRows.value = total
    items.value = data.map((d: any) => new Entity(d))

    isLoading.value = false
  }
}

const toggleSelectedItem = (item: FilterItem) => {
  const idx = selectedItemsIds.value.indexOf(item.uid)
  if (idx === -1) {
    selectedItems.value.push(item)
  } else {
    selectedItems.value.splice(idx, 1)
  }

  // emit('filter-changed', {
  //   ...props.filter,
  //   items: selectedItems.value,
  //   q: selectedItemsIds.value
  // })
}

watch(
  () => props.isVisible,
  async () => {
    if (!props.isVisible) return
    await nextTick()
    suggestionQueryRef.value?.focus()
    if (filterItemsIds.value.length) {
      suggestionQuery.value = props.filter.items[props.filter.items.length - 1].name
    }
    await fetchEntities()
  },
  {
    immediate: true
  }
)
watch(
  suggestionQuery,
  () => {
    paginationCurrentPage.value = 1
    items.value = []
    fetchEntities()
  },
  {
    immediate: true
  }
)
</script>

<style>
.EntitySuggester .item-label-wrapper {
  font-size: 0.9em;
  cursor: pointer;
}
.EntitySuggester .item-label-wrapper.active {
  background: black;
  color: white;
}
.EntitySuggester .modal-header {
  border-bottom: 1px solid transparent;
}
</style>
