<template lang="html">
  <div class="collection-add-to">
    <div class="header bg-light p-2 border-bottom">
      <div class="input-group w-100">
        <input type="text"
          class="form-control"
          v-bind:placeholder="$t('placeholder')"
          v-on:input="onInput"
          v-on:keyup.enter="addCollection(inputString.trim())"
          v-model="inputString"
          />
          <div class="input-group-append">
            <b-button
              size="sm"
              variant="outline-primary"
              class="float-right"
              v-bind:disabled="isDisabled == 0"
              v-on:click="addCollection(inputString.trim())"
              >
              {{$t('create_new')}}
            </b-button>
          </div>
      </div>
    </div>
    <b-container fluid class="inputList p-0">
      <ul>
        <li v-for="collection in filteredCollections" class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-bind:id="collection.uid"
            v-bind:checked="isActive(collection)"
            />
          <span class="checkmark dripicons-checkmark" />
          <label
            class="form-check-label py-2 pr-2"
            v-on:click="toggleActive(collection, $event)"
            for="collection.uid">
            <span>{{collection.name}}</span>

            <!-- <span class="description text-muted small-caps">
              &mdash;
              {{collection.countEntities}} {{$t('items')}}
            </span> -->
            &middot;
            <span
              class="description text-muted small-caps"
              :title="$t('last_edited')">{{$d(collection.lastEditedDate, 'compact')}}</span>
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
    isDisabled: false,
    inputString: '',
  }),
  model: {
    prop: ['item', 'items'],
  },
  props: {
    item: Object,
    items: Array,
  },
  computed: {
    filteredCollections() {
      return this.collections.filter((collection) => {
        const searchRegex = new RegExp(this.inputString, 'i');
        return searchRegex.test(collection.name) ||
          searchRegex.test(collection.description);
      });
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
  },
  methods: {
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
    onInput() {
      const len = this.inputString.trim().length;
      this.isDisabled = (len >= 3 && len <= 50);
    },
    isActive(needle) {
      if (this.items) {
        let matches = 0;
        this.items.forEach((item) => {
          if (item.collections
            && item.collections.find(collection => needle.uid === collection.uid)) matches += 1;
        });
        const el = document.querySelector(`.addbulk #${needle.uid}`);
        if (el) el.indeterminate = false;
        if (matches === 0) return false;
        else if (matches === this.items.length) return true;
        if (el) el.indeterminate = true;
      }
      if (!this.item || !this.item.collections) {
        return false;
      }
      return this.item.collections.find(collection => needle.uid === collection.uid);
    },
    toggleActive(collection) {
      const items = this.items ? this.items : [this.item];
      const id0 = items[0].collections.findIndex(c => (c.uid === collection.uid));

      items.forEach((item) => {
        if (id0 !== -1) {
          this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
            collection,
            item,
          }).then(() => {
            const idx = item.collections.findIndex(c => (c.uid === collection.uid));
            item.collections.splice(idx, 1);
            this.$forceUpdate();
          });
        } else {
          this.$store.dispatch('collections/ADD_COLLECTION_ITEM', {
            collection,
            item,
            contentType: 'article',
          }).then(() => {
            item.collections.push(collection);
            this.$forceUpdate();
          });
        }
      });
    },
    addCollection(collectionName) {
      if (!this.isDisabled) {
        return;
      }
      this.$store.dispatch('collections/ADD_COLLECTION', {
        name: collectionName,
      }).then((collection) => {
        this.toggleActive(collection);
        this.inputString = '';
        this.fetch();
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.collection-add-to {
  min-width: 400px;
  input {
    font-style: italic;
    &:focus {
    }
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
        input:checked ~ .checkmark {
          display: block;
        }
        input:indeterminate ~ label {
          background: rgba($clr-accent-secondary, 0.25);
        }
        input:checked ~ label {
          background: rgba($clr-accent-secondary, 0.5);
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
          div, span {
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
    "placeholder": "filter or create new collection",
    "create_new": "Create New",
    "manage_collections": "Manage my Collections",
    "created": "Created:",
    "last_edited": "Last edited",
    "items": "items"
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
