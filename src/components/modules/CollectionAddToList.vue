<template>
  <div class="CollectionAddToList">
    <div class="header p-2">
      <div class="input-group">
        <input
          type="text"
          class="form-control form-control-md rounded-sm"
          :placeholder="$t('placeholder')"
          @input="onInput"
          @keyup.enter="addCollection(inputString.trim())"
          ref="inputStringRef"
          :disabled="isLoading"
          v-model="inputString"
        />
        <div
          class="input-group-append"
          v-if="!isDisabled && !isLoading && !filteredCollections.length"
        >
          <b-button
            size="sm"
            variant="outline-primary"
            class="float-right"
            @click="addCollection(inputString.trim())"
          >
            {{ $t('create_new') }}
          </b-button>
        </div>
      </div>

      <div
        v-if="lastErrorMessage !== ''"
        class="alert alert-danger text-small w-100 mt-2 mb-0"
        role="alert"
      >
        {{ $t(lastErrorMessage) }}
      </div>
    </div>
    <ul class="p-0">
      <li v-if="isFetchingCollections && !collections.length">
        <i-spinner class="text-center p-5" />
      </li>
      <CollectionAddToListItem
        v-for="collection in filteredCollections"
        :key="collection.uid"
        :collection="collection"
        :is-loading="isLoading"
        :is-checked="collectionStates.get(collection.uid)?.isActive ?? false"
        @toggle="toggleActive"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { collections as collectionsService } from '@/services'
import { collectionsItems as collectionsItemsService } from '@/services'
import { ref, onUpdated, computed, watch } from 'vue'
import Collection from '@/models/Collection'
import CollectionAddToListItem from './CollectionAddToListItem.vue'

export interface ItemWithCollections {
  itemId: string
  collectionIds?: string[]
  added?: boolean
  removed?: boolean
}

export interface Props {
  items: ItemWithCollections[]
  loadingDelay?: number
  isVisible?: boolean
}

interface CollectionState {
  isActive: boolean
  state: 'checked' | 'unchecked' | 'indeterminate'
}

const props = withDefaults(defineProps<Props>(), {
  loadingDelay: 200
})

const isDisabled = ref(true)
const inputString = ref('')
const lastErrorMessage = ref('')
const isFetchingCollections = ref(false)
const isLoading = ref(false)

const inputStringRef = ref<HTMLInputElement>()
const collections = ref<Collection[]>([])

const filteredCollections = computed(() => {
  if (!inputString.value.trim()) {
    return collections.value
  }

  const searchRegex = new RegExp(inputString.value.trim(), 'i')
  return collections.value.filter(
    collection => searchRegex.test(collection.name) || searchRegex.test(collection.description)
  )
})

const emit = defineEmits<{
  (e: 'change', payload: { items: ItemWithCollections[]; collection: Collection }): void
}>()

// Memoize collection states to avoid recalculating on every render
const collectionStates = computed(() => {
  const stateMap = new Map<string, CollectionState>()

  collections.value.forEach(collection => {
    const itemsWithCollection = props.items.filter(item =>
      item.collectionIds?.includes(collection.uid)
    )

    const count = itemsWithCollection.length
    let state: 'checked' | 'unchecked' | 'indeterminate'

    if (count === 0) {
      state = 'unchecked'
    } else if (count === props.items.length) {
      state = 'checked'
    } else {
      state = 'indeterminate'
    }

    stateMap.set(collection.uid, {
      isActive: state === 'checked',
      state
    })
  })

  return stateMap
})

const fetch = async (
  params = {
    query: {
      limit: 10,
      offset: 0,
      orderBy: 'createdAt'
    }
  } as {
    query: {
      limit?: number
      offset?: number
      orderBy?: string
      q?: string
    }
  }
) => {
  isFetchingCollections.value = true
  try {
    const [results] = await Promise.all([
      collectionsService.find(params).then(res => {
        return res.data as {
          accessLevel: 'private' | 'public'
          createdAt: Date
          description: string
          title: string
          totalItems: number
          uid: string
          updatedAt: Date
        }[]
      }),
      // setTimeout with delay to show spinner for at least 300ms
      new Promise(resolve => setTimeout(resolve, props.loadingDelay))
    ])
    collections.value = results.map(
      item =>
        new Collection({
          uid: item.uid,
          name: item.title,
          countItems: item.totalItems,
          status: item.accessLevel,
          description: item.description,
          lastModifiedDate: new Date(item.updatedAt),
          creationDate: new Date(item.createdAt)
        })
    )
  } catch (e: any) {
    lastErrorMessage.value = e.message
  } finally {
    isFetchingCollections.value = false
  }
}

watch(
  () => props.isVisible,
  newVal => {
    if (newVal) {
      fetch()
    }
  },
  { immediate: false }
)

const onInput = () => {
  lastErrorMessage.value = ''
  const input = inputString.value.trim()
  isDisabled.value =
    input.length < 3 ||
    input.length > 50 ||
    collections.value.some(item => item.name.toLowerCase() === input.toLowerCase())
}

const toggleActive = async (collection: Collection) => {
  console.info('[CollectionAddToList] toggleActive', collection)

  const itemsIdsToAdd = []
  const itemsIdsToRemove = []
  const updatedItems = []

  for (const item of props.items) {
    const itemCopy: ItemWithCollections = {
      ...item,
      collectionIds: item.collectionIds || [],
      added: false,
      removed: false
    }
    if (item.collectionIds?.includes(collection.uid)) {
      itemsIdsToRemove.push(item.itemId)
      itemCopy.removed = true
      itemCopy.collectionIds = itemCopy.collectionIds.filter(id => id !== collection.uid)
    } else {
      // to be added!
      itemsIdsToAdd.push(item.itemId)
      itemCopy.added = true
      itemCopy.collectionIds = [collection.uid, ...itemCopy.collectionIds]
    }
    updatedItems.push(itemCopy)
  }

  if (!itemsIdsToAdd.length && !itemsIdsToRemove.length) {
    // nothing to do
    return
  }

  try {
    isLoading.value = true
    if (itemsIdsToAdd.length) {
      await collectionsItemsService.patch(
        null,
        { add: itemsIdsToAdd },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
    }
    if (itemsIdsToRemove.length) {
      await collectionsItemsService.patch(
        null,
        { remove: itemsIdsToRemove },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
    }
    emit('change', { items: updatedItems, collection })
  } catch (e: any) {
    lastErrorMessage.value = e.message
  } finally {
    isLoading.value = false
  }
}

const addCollection = async (collectionName: string) => {
  // if (isDisabled.value) {
  //   return
  // }
  // try {
  //   const collection = await collectionsStore.addCollection({ name: collectionName })
  //   await toggleActive(collection)
  //   inputString.value = ''
  //   await fetch()
  // } catch (e: any) {
  //   if (e.code === 400) {
  //     lastErrorMessage.value = 'NotValidLength'
  //   } else if (e.code === 409) {
  //     lastErrorMessage.value = 'name_already_exists'
  //   } else {
  //     lastErrorMessage.value = e.message || 'An error occurred'
  //   }
  // }
}

onUpdated(() => {
  inputStringRef.value?.focus()
})
</script>

<style lang="css">
.CollectionAddToList {
  min-width: 300px;
  max-width: 350px;
}

.CollectionAddToList .header {
  border-bottom: 1px solid var(--clr-grey-200-rgba-20);
}

.CollectionAddToList ul {
  max-height: 40vh;
  overflow: scroll;
  list-style: none;
}
</style>

<i18n lang="json">
{
  "en": {
    "placeholder": "... type or pick a collection name",
    "create_new": "Create New",
    "manage_collections": "Manage my Collections",
    "created": "Created:",
    "items": "items",
    "name_already_exists": "This collection label has already been used, please choose another one",
    "NotValidLength": "Collection label must be between 3 and 50 characters long"
  },
  "de": {
    "placeholder": "Filtern oder neue Sammlung erstellen",
    "create_new": "Sammlung erstellen",
    "manage_collections": "Sammlungen verwalten",
    "created": "Erstellt:",
    "items": " Artikel"
  }
}
</i18n>
