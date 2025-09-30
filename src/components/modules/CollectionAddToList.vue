<template>
  <div class="CollectionAddToList">
    <div class="header bg-light p-2 border-bottom">
      <div class="input-group">
        <input
          type="text"
          class="form-control form-control-sm"
          v-bind:placeholder="$t('placeholder')"
          v-on:input="onInput"
          v-on:keyup.enter="addCollection(inputString.trim())"
          ref="inputStringRef"
          v-model="inputString"
        />
        <div class="input-group-append">
          <b-button
            size="sm"
            variant="outline-primary"
            class="float-right"
            v-bind:disabled="isDisabled"
            v-on:click="addCollection(inputString.trim())"
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
      <li v-if="!Object.keys(collections).length">
        <i-spinner class="text-center p-5" />
      </li>
      <li
        v-for="(collection, index) in filteredCollections"
        v-bind:key="index"
        class="py-1"
        :class="{
          active: isActive(collection)
        }"
      >
        <input
          class="form-check-input"
          type="checkbox"
          v-bind:id="collection.uid"
          v-bind:checked="isActive(collection)"
          v-bind:class="isIndeterminate(collection)"
        />
        <span class="checkmark checkmark-checked dripicons-checkmark" />
        <span class="checkmark checkmark-indeterminate dripicons-minus" />
        <span class="form-check-label" v-on:click="toggleActive(collection)" for="collection.uid">
          <b>{{ collection.name }}</b>
          <br />
          <span class="description text-muted small" :title="$t('last_edited')">
            {{ collection.lastModifiedDate.toString().substring(0, 15) }}</span
          >
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'
import { ref, onUpdated, computed } from 'vue'
import Collection from '@/models/Collection'

export interface ItemWithCollections {
  itemId: string
  collectionIds?: string[]
}

export interface Props {
  items: ItemWithCollections[]
}

const { items } = defineProps<Props>()

const isDisabled = ref(true)
const inputString = ref('')
const lastErrorMessage = ref('')

const inputStringRef = ref<HTMLInputElement>()

const collectionsStore = useCollectionsStore()

const collections = computed(() => {
  return collectionsStore.collections
})

const filteredCollections = computed(() => {
  return collections.value.filter(collection => {
    const searchRegex = new RegExp(inputString.value, 'i')
    return searchRegex.test(collection.name) || searchRegex.test(collection.description)
  })
})

const fetch = async () =>
  collectionsStore.loadCollections().catch(e => (lastErrorMessage.value = e.message))

const onInput = () => {
  lastErrorMessage.value = ''
  const input = inputString.value.trim()
  isDisabled.value =
    input.length < 3 ||
    input.length > 50 ||
    collections.value.some(item => item.name.toLowerCase() === input.toLowerCase())
}

const isIndeterminate = (targetCollection: Collection) => {
  const itemsWithCollection = items.filter(item =>
    item.collectionIds?.some(cid => cid === targetCollection.uid)
  )

  if (itemsWithCollection.length === 0) return 'unchecked'
  if (itemsWithCollection.length === items.length) return 'checked'
  return 'indeterminate'
}

const isActive = (targetCollection: Collection) => {
  return isIndeterminate(targetCollection) === 'checked'
}

const toggleActive = (collection: Collection) => {
  const itemsFiltered: ItemWithCollections[] = []
  const checked = isIndeterminate(collection) === 'checked'

  items.forEach(item => {
    const idx = item.collectionIds?.findIndex(c => c === collection.uid)
    if (checked && idx !== -1) {
      itemsFiltered.push(item)
    } else if (!checked && idx === -1) {
      itemsFiltered.push(item)
    }
  })

  if (!checked) {
    // add items to collection
    collectionsStore
      .addCollectionItems({
        items:
          itemsFiltered?.map(i => ({
            uid: i.itemId
          })) || [],
        collection,
        contentType: 'article'
      })
      .then(() => {
        itemsFiltered.forEach(item => {
          item.collectionIds?.push(collection.uid)
        })
      })
  } else {
    // remove items from collection
    collectionsStore
      .removeCollectionItems({
        items:
          itemsFiltered?.map(i => ({
            uid: i.itemId
          })) || [],
        collection
      })
      .then(() => {
        itemsFiltered.forEach(item => {
          const idx = item.collectionIds?.findIndex(c => c === collection.uid)
          item.collectionIds?.splice(idx, 1)
        })
      })
  } // end remove items from collection
}

const addCollection = collectionName => {
  if (isDisabled) {
    return
  }
  collectionsStore
    .addCollection({ name: collectionName })
    .then(collection => {
      toggleActive(collection)
      inputString.value = ''
      fetch()
    })
    .catch(e => {
      if (e.code === 400) {
        lastErrorMessage.value = 'NotValidLength'
      } else if (e.code === 409) {
        lastErrorMessage.value = 'name_already_exists'
      } else {
        throw e
      }
    })
}

onUpdated(() => {
  inputStringRef.value.focus()
})
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.CollectionAddToList {
  min-width: 250px;
  max-width: 350px;
  --checkmark-width: 40px;
}

.CollectionAddToList ul {
  max-height: 40vh;
  overflow: scroll;
  list-style: none;
}
.CollectionAddToList ul li {
  position: relative;
  padding-inline-start: var(--checkmark-width);
  border-radius: 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--clr-grey-200-rgba-20);
}
.CollectionAddToList ul li label {
  font-variant: normal !important;
  font-size: inherit;
}
.CollectionAddToList ul li input,
.CollectionAddToList ul li .checkmark {
  display: none;
}
.CollectionAddToList ul li .checkmark {
  position: absolute;
  pointer-events: none;
  height: 1em;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--checkmark-width);
  text-align: center;
}
.CollectionAddToList ul li.active {
  // box-shadow: var(--bs-box-shadow-sm);
  background-color: var(--clr-grey-200-rgba-20);
  padding-inline-start: var(--checkmark-width);
}
.CollectionAddToList ul li label .description {
  font-size: var(--impresso-font-size-smaller);
}

.CollectionAddToList ul li input.checked ~ .checkmark-checked {
  display: block;
}
</style>

<i18n lang="json">
{
  "en": {
    "placeholder": "... type or pick a collection name",
    "create_new": "Create New",
    "manage_collections": "Manage my Collections",
    "created": "Created:",
    "last_edited": "Last edited",
    "items": "items",
    "name_already_exists": "This collection label has already been used, please choose another one",
    "NotValidLength": "Collection label must be between 3 and 50 characters long"
  },
  "de": {
    "placeholder": "Filtern oder neue Sammlung erstellen",
    "create_new": "Sammlung erstellen",
    "manage_collections": "Sammlungen verwalten",
    "created": "Erstellt:",
    "last_edited": "Zuletzt bearbeitet",
    "items": " Artikel"
  }
}
</i18n>
