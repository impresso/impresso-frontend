<template>
  <div class="collection-add-to">
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
    <b-container fluid class="inputList p-0">
      <ul>
        <li v-if="!Object.keys(this.collections).length">
          <i-spinner class="text-center p-5" />
        </li>
        <li
          v-for="(collection, index) in filteredCollections"
          v-bind:key="index"
          class="form-check"
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
            class="form-check-label py-2 pr-2"
            v-on:click="toggleActive(collection, $event)"
            for="collection.uid"
          >
            <span>{{ collection.name }}</span>

            <!-- <span class="description text-muted small-caps">
                &mdash;
                {{collection.countEntities}} {{$t('items')}}
              </span> -->
            &middot;
            <span class="description text-muted small-caps" :title="$t('last_edited')">
              {{ collection.lastModifiedDate.toString().substring(0, 15) }}</span
            >
          </label>
        </li>
      </ul>
    </b-container>
  </div>
</template>

<script>
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
    filteredCollections() {
      return this.collections.filter((collection) => {
        const searchRegex = new RegExp(this.inputString, 'i')
        return searchRegex.test(collection.name) || searchRegex.test(collection.description)
      })
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections']
      },
    },
  },
  methods: {
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS')
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
        this.collections.some((item) => item.name.toLowerCase() === input.toLowerCase())
    },
    isIndeterminate(needle) {
      const items = this.items || [this.item]
      let matches = 0
      items.forEach((item) => {
        if (
          item.collections &&
          item.collections.find((collection) => needle.uid === collection.uid)
        )
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

      items.forEach((item) => {
        const idx = item.collections.findIndex((c) => c.uid === collection.uid)
        if (checked && idx !== -1) {
          itemsFiltered.push(item)
        } else if (!checked && idx === -1) {
          itemsFiltered.push(item)
        }
      })

      if (!checked) {
        // add items to collection
        this.$store
          .dispatch('collections/ADD_COLLECTION_ITEMS', {
            items: itemsFiltered,
            collection,
            contentType: 'article',
          })
          .then(() => {
            itemsFiltered.forEach((item) => {
              item.collections.push(collection)
            })
          })
      } else {
        // remove items from collection
        this.$store
          .dispatch('collections/REMOVE_COLLECTION_ITEMS', {
            items: itemsFiltered,
            collection,
            contentType: 'article',
          })
          .then(() => {
            itemsFiltered.forEach((item) => {
              const idx = item.collections.findIndex((c) => c.uid === collection.uid)
              item.collections.splice(idx, 1)
            })
          })
      } // end remove items from collection
    },
    addCollection(collectionName) {
      if (this.isDisabled) {
        return
      }
      this.$store
        .dispatch('collections/ADD_COLLECTION', {
          name: collectionName,
        })
        .then((collection) => {
          this.toggleActive(collection)
          this.inputString = ''
          this.fetch()
        })
        .catch((e) => {
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
      return this.$store.state.user.userData
    },
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';

.collection-add-to {
  min-width: 265px;
  input {
    font-style: italic;
  }
  .inputList {
    max-height: 50vh;
    overflow: scroll;
    ul {
      overflow-y: auto;
      height: 100%;
      list-style: none;
      padding: 0;
      margin-bottom: -1px;
      li {
        padding: 0;
        input {
          display: none;
        }
        .checkmark {
          display: none;
          position: absolute;
          pointer-events: none;
          height: 1em;
          margin: auto;
          top: 0;
          bottom: 0;
          left: 0.75em;
        }
        input.checked ~ .checkmark-checked {
          display: block;
        }
        input.indeterminate ~ .checkmark-indeterminate {
          display: block;
        }
        input.checked ~ label {
          background: rgba($clr-accent-secondary, 0.5);
        }
        input.indeterminate ~ label {
          background: rgba($clr-accent-secondary, 0.25);
        }
        label {
          display: block;
          cursor: pointer;
          border-bottom: 1px solid $clr-bg-secondary;
          padding-left: 3em;
          &.loading {
            background: $clr-accent-secondary;
          }
          &:hover {
            background: $clr-accent-secondary;
          }
          div,
          span {
            pointer-events: none;
          }
        }
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "placeholder": "type or choose a collection",
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
