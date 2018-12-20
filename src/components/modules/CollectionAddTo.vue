<template lang="html">
  <div class="collection-add-to">
    <div class="header bg-light p-2 border-bottom">
      <input type="text" name="" value="" class="w-100 p-1"
        v-bind:placeholder="$t('placeholder')"
        v-on:input="onInput"
        v-model="inputString"
        />
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

            <span class="description text-muted small-caps">
              &mdash;
              {{collection.countEntities}} {{$t('items')}}
            </span>
            &middot;
            <span
              class="description text-muted small-caps"
              :title="$t('last_edited')">{{$d(collection.lastEditedDate, 'compact')}}</span>
          </label>
        </li>
      </ul>
    </b-container>
    <div class="footer bg-light p-2 border-top">
        <b-button size="sm" variant="primary"
          v-bind:disabled="isDisabled == 0"
          v-on:click="addCollection(inputString.trim())"
          >
          {{$t('create_new')}}
        </b-button>
        <router-link class="btn btn-sm btn-outline-primary float-right" v-bind:to="{ name: 'collection'}">{{ $t('manage_collections') }}</router-link>
    </div>
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
    prop: 'item',
  },
  props: {
    item: Object,
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
      this.isDisabled = (this.inputString.trim().length > 4);
    },
    isActive(needle) {
      // console.log(this.item, needle.uid);
      if (!this.item.collections) {
        return false;
      }
      return this.item.collections.find(collection => needle.uid === collection.uid);
    },
    toggleActive(collection, event) {
      event.target.classList.add('loading');
      const idx = this.item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item: this.item,
        }).then(() => {
          // remove the collection at index.
          this.item.collections.splice(idx, 1);
          event.target.classList.remove('loading');
        });
      } else {
        this.$store.dispatch('collections/ADD_COLLECTION_ITEM', {
          collection,
          item: this.item,
        }).then(() => {
          this.item.collections.push(collection);
          event.target.classList.remove('loading');
        });
      }
    },
    addCollection(collectionName) {
      this.$store.dispatch('collections/ADD_COLLECTION', {
        name: collectionName,
      }).then((res) => {
        console.log(res);
        this.inputString = '';
        this.fetch();
        // TODO: add item to ne collection
      });
    },
    toggle() {
      this.show = !this.show;
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
  mounted() {
    this.fetch();
    // this.fetch().then(() => {
    //   this.select(this.collections.find(c => c.uid === this.$route.params.collection_uid) ||
    //     this.collectionAll);
    // });
  },
  // components: {
  //   Icon,
  // },
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
          &:active {
            background: $clr-accent-secondary;
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
    "create_new": "Create New Collection",
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
