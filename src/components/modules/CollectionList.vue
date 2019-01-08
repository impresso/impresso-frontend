<template lang="html">
  <i-layout class="collection-list">
    <i-layout-section>
      <div slot="header" class="header px-3 py-2 border-bottom">
        <div class="input-group input-group-sm">
        <input type="text" name="" value="" class="form-control"
          v-bind:placeholder="$t('placeholder')"
          v-model="inputString"
          />
          <div class="input-group-append">
            <label class="ml-2 mr-1" style="padding-top: 0.5em">{{$t("label_order")}}</label>
            <i-dropdown v-model="collectionsSortOrder" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </div>
        </div>
      </div>
      <b-container fluid class="inputList p-0 bg-light">
        <ul>
          <li v-for="collection in filteredCollections">
            <label
              class="m-0 px-3 py-2 border-bottom"
              v-on:click="select(collection, $event)"
              v-bind:class="{ 'selected': collection.uid === $route.params.collection_uid }"
              for="collection.uid">
              <div class="clearfix">
                <div class="float-left bold">
                  {{collection.name}}
                </div>
                <div class="float-right">
                  {{collection.countEntities}} {{$t('items')}}
                </div>
              </div>
              <div class="clearfix">
                <div class="description float-left">
                  {{collection.description}}
                </div>
                <div class="float-right text-muted">
                  {{$t('created')}} {{$d(collection.createdDate, 'compact')}}
                </div>
              </div>
            </label>
          </li>
        </ul>
      </b-container>
      <div slot="footer" class="p-3 border-top">
        <div class="input-group input-group-sm">
        <input type="text" name="" value="" class="form-control"
          v-bind:placeholder="$t('inputNewPlaceholder')"
          v-on:input="onInputNew"
          v-on:keyup.enter="addCollection(inputNew)"
          v-model="inputNew"
          />
          <div class="input-group-append">
            <b-button variant="outline-primary"
              size="sm"
              v-bind:disabled="isDisabled == 0"
              v-on:click="addCollection(inputNew)"
              >
              {{$t('create_new')}}
            </b-button>
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
export default {
  data: () => ({
    show: false,
    isDisabled: false,
    inputString: '',
    inputNew: '',
  }),
  computed: {
    orderByOptions: {
      get() {
        return [
          {
            value: 'name',
            text: `${this.$t('a-z')}`,
          },
          {
            value: '-name',
            text: `${this.$t('z-a')}`,
          },
          {
            value: 'created',
            text: `${this.$t('oldest')}`,
          },
          {
            value: '-created',
            text: `${this.$t('newest')}`,
          },
          {
            value: '-modified',
            text: `${this.$t('last-edited')}`,
          },
        ];
      },
    },
    collectionsSortOrder: {
      get() {
        return this.$store.getters['collections/collectionsSortOrder'];
      },
      set(collectionsSortOrder) {
        this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', {
          collectionsSortOrder,
        });
        // console.log('set', collectionsSortOrder);
      },
    },
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
    select(collection) {
      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined,
        },
      });
    },
    onInputNew() {
      const len = this.inputNew.trim().length;
      this.isDisabled = (len >= 3 && len <= 50);
    },
    addCollection(collectionName) {
      this.inputNew = '';
      this.onInputNew();
      this.$store.dispatch('collections/ADD_COLLECTION', {
        name: collectionName.trim(),
      }).then((res) => {
        // console.log(res);
        this.fetch();
        this.select(res);
      });
    },
  },
  mounted() {
    this.fetch().then(() => {
    });
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.collection-list {
  input {
    font-style: italic;
    &:focus {
    }
  }
  .inputList {
    height: 100%;
    overflow: scroll;
    ul {
      list-style: none;
      padding: 0;
      li {
        padding: 0;

        label {
          display: block;
          background: $clr-bg-primary;
          cursor: pointer;

          &.loading {
            background: rgba($clr-accent-secondary, 0.5);
          }
          &:hover {
            background: $clr-bg-secondary;
          }
          &:active {
            background: rgba($clr-accent-secondary, 0.5);
          }
          &.selected {
            background: $clr-accent-secondary;
            color: white;
          }

          span, div {
            pointer-events: none;
            cursor: pointer;
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
    "placeholder": "Filter",
    "inputNewPlaceholder": "New Collection Name",
    "label_order": "Order By",
    "create_new": "Create Collection",
    "created": "Created:",
    "last_edited": "Last edited",
    "items": "items"
  },
  "de": {
    "placeholder": "Filtern",
    "label_order": "Sortieren nach",
    "create_new": "Sammlung erstellen",
    "created": "Erstellt:",
    "last_edited": "Zuletzt bearbeitet",
    "items": " Artikel"
  }
}
</i18n>
