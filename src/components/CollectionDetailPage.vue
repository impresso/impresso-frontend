<template lang="html">
  <i-layout-section v-if="$route.params.collection_uid">

    <div slot="header">
      <b-navbar type="light" variant="light" class="border-bottom">

        <section>

          <span class="label small-caps">
            <router-link v-bind:to="{ name: 'collections' }">&larr; {{$t("Collections")}}</router-link>
          </span>

          <h3>{{collection.name}}</h3>
          <p>
            {{collection.description}}
          </p>

        </section>


        <section class="ml-auto py-3">

          <router-link :to="{ name: 'compare', query: { left: `c:${$route.params.collection_uid}`} }" class="float-right mb-1">
            <b-button
              variant="outline-info" size="sm"
              v-b-modal.confirmDelete>{{ $t('compare_collection') }}
            </b-button>
          </router-link>

          <b-dropdown size="sm" variant="outline-primary" :text="$t('edit_collection')" class="d-block" ref="edit_collection">
            <div class="modal-edit pt-2 px-3 background-light">
              <label for="collectionName">Name</label>
              <input type="text" name="collectionName" class="form-control mb-3"
                v-on:keyup.enter="save(collection)"
                v-model="collection.name">
              <label for="collectionDesc">Description</label>
              <textarea type="text" name="collectionDesc" class="form-control"
                v-on:keyup.enter="save(collection)"
                v-model="collection.description" />
              <b-button variant="outline-primary" size="sm" class="form-control my-3"
                v-on:click="save(collection)">{{ $t('update_collection') }}
              </b-button>
              <b-button
                class="form-control mb-3"
                variant="outline-danger" size="sm"
                v-on:click.alt="remove(collection)"
                v-on:click.exact="$bvModal.show('confirmDelete')">
                {{ $t('delete_collection') }}
              </b-button>
            </div>
          </b-dropdown>

        </section>

        <b-modal id="confirmDelete" v-on:ok="remove(collection)">
          {{this.$t('confirm_delete', [collection.name])}}
        </b-modal>

      </b-navbar>

      <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom border-tertiary">
        <b-navbar-nav class="p-3 border-right">
          <li>
            <label v-html="$tc('articles', paginationTotalRows) "></label>
          </li>
        </b-navbar-nav>

        <b-navbar-nav class="p-3">
          <li><label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>

        <b-navbar-nav class="p-3 border-left ml-auto">
          <li>
            <label class="mr-1">{{ $t('label_display') }}</label>
            <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
              <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
              <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
            </b-form-radio-group>
          </li>
        </b-navbar-nav>


      </b-navbar>
    </div>


    <div class="collection-group">

      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`">
            <search-results-list-item
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
          </b-col>
        </b-row>

        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="4" lg="3"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`">
            <!-- {{article}} -->
            <search-results-tiles-item
              v-if="article.type === 'ar'"
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
            <search-results-image-item
              v-if="article.type !== 'ar'"
              v-bind:searchResult="article"
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
          </b-col>
        </b-row>
      </b-container>
      <div class="my-5" />
      <div v-if="paginationTotalRows > paginationPerPage" slot="footer" class="fixed-pagination-footer p-1 m-0">
        <pagination
          size="sm"
          v-bind:perPage="paginationPerPage"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps" />
      </div>
    </div>


    <div v-if="entities.length > 0" class="collection-group">
      <hr>
      <h4>Entities</h4>
      <div class="grid">
        <div class="item" v-for="(entity, index) in entities" v-bind:key="index">
          {{entity}}
        </div>
      </div>
    </div>

    <div v-if="issues.length > 0" class="collection-group">
      <h4>Issues</h4>
      <div class="grid">
        <div class="item" v-for="(issue, index) in issues" v-bind:key="index">
          {{issue}}
        </div>
      </div>
    </div>

    <div v-if="pages.length > 0" class="collection-group">
      <h4>Pages</h4>
      <div class="grid">
        <div class="item" v-for="(page, index) in pages" v-bind:key="index">
          <open-seadragon-viewer v-model="page.iiif" />
        </div>
      </div>
    </div>

  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import Pagination from './modules/Pagination';

export default {
  data: () => ({
    tab: {},
    collection: new Collection(),
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsImageItem,
    Pagination,
  },
  computed: {
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
    displayStyle: {
      get() {
        return this.$store.state.search.displayStyle;
      },
      set(displayStyle) {
        this.$store.commit('search/UPDATE_SEARCH_DISPLAY_STYLE', displayStyle);
      },
    },
    pages: {
      get() {
        return this.collection.items.filter(item => (item.labels && item.labels[0] === 'page'));
      },
    },
    entities: {
      get() {
        return this.collection.items.filter(item => (item.labels && item.labels[0] === 'entity'));
      },
    },
    articles: {
      get() {
        return this.$store.getters['collections/collectionItems'];
      },
    },
    issues: {
      get() {
        return this.collection.items.filter(item => (item.labels && item.labels[0] === 'issue'));
      },
    },
    paginationPerPage: {
      get() {
        return this.$store.state.collections.paginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.collections.paginationCurrentPage;
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.collections.paginationTotalRows;
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'dateAdded',
            text: `${this.$t('sort_dateAdded')} ${this.$t('sort_asc')}`,
            disabled: true,
          },
          {
            value: '-dateAdded',
            text: `${this.$t('sort_dateAdded')} ${this.$t('sort_desc')}`,
            disabled: true,
          },
          {
            value: 'itemDate',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
            disabled: true,
          },
          {
            value: '-itemDate',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
            disabled: true,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.collections.orderBy;
      },
      set(val) {
        this.$store.commit('collections/UPDATE_ITEMS_ORDER_BY', val);
        this.getCollectionItems(1);
      },
    },
  },
  mounted() {
    this.getCollection();
  },
  watch: {
    $route() {
      this.getCollection();
    },
  },
  methods: {
    getCollectionItems(page) {
      if (page !== undefined) {
        this.$store.commit('collections/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('collections/LOAD_COLLECTION', this.collection).then((res) => {
        this.collection = res;
      });
    },
    getCollection() {
      this.collection = {
        uid: this.$route.params.collection_uid,
        items: [],
      };
      this.getCollectionItems();
    },
    gotoArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_number: article.pages[0].num,
          page_uid: article.pages[0].uid,
          article_uid: article.uid,
        },
      });
    },
    remove(collection) {
      this.$store.dispatch('collections/DELETE_COLLECTION', collection.uid).then(() => {
        this.$store.dispatch('collections/LOAD_COLLECTIONS').then(() => {
          this.$router.push({
            name: 'collections',
          });
        });
      });
    },
    save(collection) {
      if (collection.uid) {
        this.$store.dispatch('collections/EDIT_COLLECTION', {
          uid: collection.uid,
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          const idx = this.collections.findIndex(c => c.uid === res.uid);
          this.collections[idx].name = res.name;
          this.collections[idx].description = res.description;
        });
      } else {
        this.$store.dispatch('collections/ADD_COLLECTION', {
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          this.fetch().then(() => {
            this.select(new Collection(res.data)); // select the newly created item
          });
        });
      }
      this.$refs.edit_collection.hide(true);
    },
    sortBy(data, field) {
      data.sort((a, b) => {
        if (a[field] < b[field]) {
          return 1;
        } else if (a[field] > b[field]) {
          return -1;
        }
        return 0;
      });
      return data;
    },
    onInputPagination(page = 1) {
      this.getCollectionItems(page);
    },
  },
};
</script>

<style lang="scss">
.modal-edit {
  min-width: 400px;
}
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "label_order": "Order By",
    "sort_date": "Item Date",
    "sort_dateAdded": "Date Added",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "articles": "No article | <b>1</b> article | <b>{n}</b> articles",
    "edit_collection": "Collection Settings",
    "update_collection": "Update Collection Note",
    "delete_collection": "Delete Collection [alt/option to bypass confirmation]",
    "compare_collection": "Compare with ...",
    "confirm_delete": "Are you sure you want to delete collection '{0}'?"
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
