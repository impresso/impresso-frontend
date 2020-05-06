<template lang="html">
  <i-layout class="collection-list">
    <i-layout-section>

      <div slot="header" class="header px-3 py-2 border-bottom">

        <div class="input-group input-group-sm mb-2">
        <input type="text" name="" :value="collectionsQ" class="form-control"
          v-bind:placeholder="$t('placeholder')"
          v-on:input="onQueryChange"
          />
          <div class="input-group-append">
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm"
            variant="outline-primary"></i-dropdown>
          </div>
        </div>

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

      <b-container fluid class="inputList p-0 bg-light">
        <ul v-if="collections.length > 0">
          <li v-for="(collection, index) in collections" v-bind:key="index">
            <div
              class="m-0 px-3 py-2 border-bottom"
              v-on:click="select(collection, $event)"
              v-bind:class="{ 'selected': collection.uid === $route.params.collection_uid }"
              for="collection.uid">
              <div class="clearfix pb-1">
                <strong class="float-left">
                  {{collection.name}}
                </strong>
              </div>
              <div class="clearfix">
                <div class="description small pb-1">
                  {{collection.description}}
                </div>
                <div v-if="collection.countItems" class="float-left text-muted small-caps">
                  {{collection.countItems}} {{$t('items')}}
                </div>
                <div v-if="collection.creationDate" class="float-right text-muted small-caps">
                  {{$t('created')}} {{ $d(collection.creationDate, 'compact')}}
                </div>
              </div>
            </div>
          </li>
        </ul>
        <ul v-else-if="fetching">
          <p class="text-center small-caps p-4">Fetching</p>
        </ul>
        <ul v-else-if="collections.length === 0">
          <p class="text-center p-4" v-html="$t('no_collection')" />
        </ul>
        <ul v-else>
          <p class="text-center p-4" v-html="$t('no_match')" />
        </ul>

        <div v-if="paginationTotalRows > paginationPerPage" slot="footer" class="fixed-pagination-footer p-1 m-0">
          <pagination
            size="sm"
            v-bind:perPage="paginationPerPage"
            v-bind:currentPage="paginationCurrentPage"
            v-bind:totalRows="paginationTotalRows"
            v-on:change="onInputPagination"
            class="float-left small-caps" />
        </div>

      </b-container>



    </i-layout-section>
  </i-layout>
</template>

<script>
import Pagination from './Pagination';

export default {
  props: {
    method: {type: Function },
  },
  data: () => ({
    // show: false,
    isDisabled: false,
    fetching: false,
    // inputString: '',
    inputNew: '',
    // orderBy: '-date',
    // collectionsQ: '',
  }),
  components: {
    Pagination,
  },
  computed: {
    paginationPerPage: {
      get() {
        return this.$store.state.collections.collectionsPaginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.collections.collectionsPaginationCurrentPage;
      },
      set(val) {
        this.$store.commit('collections/UPDATE_PAGINATION_LIST_CURRENT_PAGE', val);
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.collections.collectionsPaginationTotalRows;
      },
    },
    orderBy: {
      get() {
        return this.$store.state.collections.collectionsOrderBy;
      },
      set(val) {
        this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', val);
      },
    },
    collectionsQ: {
      get() {
        return this.$store.state.collections.collectionsQ;
      },
      set(val) {
        this.$store.commit('collections/SET_COLLECTIONS_Q', val);
      },
    },
    orderByOptions: {
      get() {
        return [
          // {
          //   value: 'name',
          //   text: `${this.$t('a-z')}`,
          // },
          // {
          //   value: '-name',
          //   text: `${this.$t('z-a')}`,
          // },
          // {
          //   value: 'created',
          //   text: `${this.$t('oldest')}`,
          // },
          // {
          //   value: '-created',
          //   text: `${this.$t('newest')}`,
          // },
          {
            value: '-date',
            text: `${this.$t('last-edited')}`,
          },
          {
            value: '-size',
            text: `${this.$t('-size')}`,
          },
          {
            value: 'size',
            text: `${this.$t('size')}`,
          },
        ];
      },
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
  },
  methods: {
    fetch() {
      this.fetching = true;
      this.$store.dispatch('collections/LOAD_COLLECTIONS').then(() => {
        this.fetching = false;
      });
    },
    onQueryChange(q) {
      this.collectionsQ = q.target.value;
      this.fetch();
    },
    onInputPagination(page) {
      this.paginationCurrentPage = page;
      this.fetch();
    },
    onInputOrder(orderBy) {
      console.log('__', orderBy);
      this.orderBy = orderBy;
      this.fetch();
    },
    select(collection) {
      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined,
        },
        query: { tab: this.$route.query.tab },
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
        this.fetch();
        this.select(res);
      });
    },
  },
  mounted() {
    this.fetch();
  },
  watch: {
    orderBy: {
      handler(val) {
        this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', val);
        this.paginationCurrentPage = 1;
        this.fetch();
      },
    },
    collectionsQ: {
      handler(val) {
        this.collectionsQ = val;
        this.paginationCurrentPage = 1;
        this.fetch();
      },
    },
  }
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";
.collection-list {
  input {
    font-style: italic;
  }
  .inputList {
    height: 100%;
    overflow: scroll;
    ul {
      list-style: none;
      padding: 0;
      li {
        padding: 0;
        background: white;
        div {
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
    "a-z": "a-z",
    "z-a": "z-a",
    "oldest": "oldest",
    "newest": "newest",
    "last-edited": "last-edited",
    "placeholder": "Filter by name / description",
    "inputNewPlaceholder": "My Collection",
    "label_order": "Order By",
    "create_new": "Create Collection",
    "created": "Created:",
    "last_edited": "Last edited",
    "items": "items",
    "no_collection": "<p><b>No personal collection found !</b></p><p>Create one ?</p>",
    "no_match": "No collection name matches your search filter."
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
