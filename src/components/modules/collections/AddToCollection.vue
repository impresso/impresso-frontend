<template>
  <BDropdown
    size="sm"
    class="AddToCollection shadow-sm rounded"
    variant="outline-secondary"
    @shown="show = true"
    @hidden="show = false"
    :text="title"
    :right="right"
  >
    <div v-if="!isLoggedIn" class="p-2 bg-light">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary w-100"
        @click="$router.push({ name: 'login' })"
      >
        {{ $t('login') }}
      </button>
    </div>
    <List
      :hide-pagination="total < paginationPerPage"
      :pagination-list="paginationList"
      @change-page="paginationCurrentPage = $event"
    >
      <template #header>
        <div class="input-group input-group-sm sans p-3">
          <BFormInput v-model="q" :placeholder="$t('searchCollections')" />
          <div class="input-group-append">
            <button
              class="btn btn-outline-secondary small btn-sm"
              type="button"
              @click="emit('create', { name: q })"
            >
              {{ $t('actions.create') }}
            </button>
          </div>
        </div>
      </template>
      <template #default>
        <div
          class="text-small border-bottom AddToCollection_item"
          v-for="(item, i) in collections"
          :key="item.id"
          @click="emit('item:click', item)"
        >
          <span class="mr-1 text-muted sans">{{ i + 1 }} of {{ total }}</span>
          <ItemLabel type="collection" :item="item" />
        </div>
        <div v-if="isLoading" class="text-center p-3">
          <LoadingBlock :height="32" />
        </div>
        <div
          v-if="!isLoading && !isPristine && !collections.length"
          class="text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center"
        >
          <slot name="empty">
            <span class="text-muted">{{ $t('no_collections_found') }}</span>
          </slot>
        </div>
      </template>
    </List>
  </BDropdown>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BDropdown from '@/components/legacy/bootstrap/BDropdown.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import List from '@/components/modules/lists/List.vue'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import { collections as collectionService } from '@/services'
import Collection from '@/models/Collection'
import { useUserStore } from '@/stores/user'

defineProps<{ title: string; right?: boolean }>()
const emit = defineEmits<{
  'item:click': [item: Collection]
  create: [payload: { name: string }]
}>()

const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.userData)
const show = ref(false)
const q = ref('')
const paginationCurrentPage = ref(1)
const paginationPerPage = 10
const total = ref(-1)
const collections = ref<Collection[]>([])
const isLoading = ref(false)
const isPristine = ref(true)
const paginationList = computed(() => ({
  currentPage: paginationCurrentPage.value,
  perPage: paginationPerPage,
  totalRows: total.value
}))

type CollectionRow = NonNullable<ConstructorParameters<typeof Collection>[0]> & {
  creation_date?: string
  last_modified_date?: string
  count_articles?: number
}

watch(
  [show, isLoggedIn, q, paginationCurrentPage],
  async ([open, loggedIn, search, page], _, onCleanup) => {
    isPristine.value = true
    isLoading.value = open && loggedIn
    if (!open || !loggedIn) return

    let stale = false
    onCleanup(() => {
      stale = true
    })
    try {
      const { data, total: count }: { data: CollectionRow[]; total: number } =
        await collectionService.find({
          query: {
            offset: paginationPerPage * (page - 1),
            page,
            limit: paginationPerPage,
            orderBy: '-date',
            q: search
          }
        })
      if (stale) return
      collections.value = data.map(
        row =>
          new Collection({
            creationDate: row.creation_date ? new Date(row.creation_date) : undefined,
            lastModifiedDate: row.last_modified_date ? new Date(row.last_modified_date) : undefined,
            countArticles: row.count_articles,
            ...row
          })
      )
      total.value = count
      isPristine.value = false
    } finally {
      if (!stale) isLoading.value = false
    }
  }
)
</script>
<style lang="css">
.AddToCollection .dropdown-menu {
  min-width: 300px;
}
.AddToCollection .items {
  max-height: 50vh;
  overflow: scroll;
}
.AddToCollection_item {
  display: block;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: 1px solid;
  cursor: pointer;
}
.AddToCollection_item:hover {
  background-color: var(--clr-grey-100);
  color: var(--white);
}

.AddToCollection_item:hover .text-muted {
  color: var(--clr-grey-700) !important;
}
</style>
<i18n lang="json">
{
  "en": {
    "searchCollections": "Search collections…",
    "no_collections_found": "No collections found",
    "actions": {
      "create": "new..."
    }
  }
}
</i18n>
