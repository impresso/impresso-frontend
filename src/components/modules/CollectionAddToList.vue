<template>
  <div class="CollectionAddToList">
    <div class="header bg-light p-2 border-bottom">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          v-bind:placeholder="$t('placeholder')"
          v-on:input="onInput"
          v-on:keyup.enter="addCollection(inputString.trim())"
          ref="inputString"
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
        v-if="newCollectionError !== ''"
        class="alert alert-danger text-small w-100 mt-2 mb-0"
        role="alert"
      >
        {{ newCollectionError }}
      </div>
    </div>
    <ul class="p-2">
      <li v-if="!Object.keys(this.collections).length">
        <i-spinner class="text-center p-5" />
      </li>
      <li
        v-for="(collection, index) in filteredCollections"
        v-bind:key="index"
        class="py-2"
        :class="{
          active: isActive(collection),
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
        <label
          class="form-check-label"
          v-on:click="toggleActive(collection, $event)"
          for="collection.uid"
        >
          <span>{{ collection.name }}</span>
          <br />
          <span class="description text-muted" :title="$t('last_edited')">
            {{ collection.lastModifiedDate.toString().substring(0, 15) }}</span
          >
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'

export default {
  data: () => ({
    show: false,
    isDisabled: true,
    inputString: '',
    newCollectionError: '',
  }),
  props: {
    item: Object,
    items: Array,
  },
  updated() {
    this.focusInput()
  },
  computed: {
    ...mapStores(useCollectionsStore, useUserStore),
    filteredCollections() {
      return this.collections.filter(collection => {
        const searchRegex = new RegExp(this.inputString, 'i')
        return searchRegex.test(collection.name) || searchRegex.test(collection.description)
      })
    },
    collections: {
      get() {
        return this.collectionsStore.collections
      },
    },
  },
  methods: {
    fetch() {
      return this.collectionsStore.loadCollections()
    },
    focusInput() {
      this.$refs.inputString.focus()
    },
    onInput() {
      this.newCollectionError = ''
      const input = this.inputString.trim()
      this.isDisabled =
        input.length < 3 ||
        input.length > 50 ||
        this.collections.some(item => item.name.toLowerCase() === input.toLowerCase())
    },
    isIndeterminate(needle) {
      const items = this.items || [this.item]
      let matches = 0
      items.forEach(item => {
        if (item.collections && item.collections.find(collection => needle.uid === collection.uid))
          matches += 1
      })
      if (matches === 0) return 'unchecked'
      if (matches === items.length) return 'checked'
      return 'indeterminate'
    },
    isActive(needle) {
      return this.isIndeterminate(needle) === 'checked'
    },
    toggleActive(collection) {
      const items = this.items ? this.items : [this.item]
      const itemsFiltered = []
      const checked = this.isIndeterminate(collection) === 'checked'

      items.forEach(item => {
        const idx = item.collections.findIndex(c => c.uid === collection.uid)
        if (checked && idx !== -1) {
          itemsFiltered.push(item)
        } else if (!checked && idx === -1) {
          itemsFiltered.push(item)
        }
      })

      if (!checked) {
        // add items to collection
        this.collectionsStore.addCollectionItems({
          items: itemsFiltered,
          collection,
          contentType: 'article',
        }).then(() => {
          itemsFiltered.forEach(item => {
            item.collections.push(collection)
          })
        })
      } else {
        // remove items from collection
        this.collectionsStore.removeCollectionItems({
          items: itemsFiltered,
          collection,
          contentType: 'article',
        }).then(() => {
          itemsFiltered.forEach(item => {
            const idx = item.collections.findIndex(c => c.uid === collection.uid)
            item.collections.splice(idx, 1)
          })
        })
      } // end remove items from collection
    },
    addCollection(collectionName) {
      if (this.isDisabled) {
        return
      }
      this.collectionsStore.addCollection({ name: collectionName })
        .then(collection => {
          this.toggleActive(collection)
          this.inputString = ''
          this.fetch()
        })
        .catch(e => {
          if (e.code === 400) {
            this.newCollectionError = this.$t('NotValidLength')
          } else if (e.code === 409) {
            this.newCollectionError = this.$t('name_already_exists')
          } else {
            throw e
          }
        })
    },
    isLoggedIn() {
      return this.userStore.userData
    },
  },
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
  border-radius: var(--impresso-border-radius-xs);
  margin-bottom: var(--spacing-2);
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
  box-shadow: var(--bs-box-shadow-sm);
  border: 1px solid var(--clr-grey-200-rgba-20);
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
