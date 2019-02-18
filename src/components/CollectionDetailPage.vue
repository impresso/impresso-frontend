<template lang="">
  <i-layout-section class="" v-if="$route.params.collection_uid">

    <div class="d-flex align-items-stretch border-bottom px-0 py-0 bg-light">

      <div class="p-3 mr-auto align-self-center">
        <div class="">
          <strong>{{collection.name}}</strong>
        </div>
        <div>
          {{collection.description}}
        </div>
      </div>

      <div class="p-3 ml-auto text-right border-left">
        <b-dropdown right size="sm" variant="outline-primary" :text="$t('edit_collection')">
          <div class="modal-edit p-3 background-light">
            <label for="collectionName">Name</label>
            <input type="text" name="collectionName" class="form-control mb-3"
              v-model="collection.name">
            <label for="collectionDesc">Description</label>
            <textarea type="text" name="collectionDesc" class="form-control"
              v-model="collection.description" />
            <b-button variant="outline-primary" size="sm" class="form-control mt-3"
              v-on:click="save(collection)">{{ $t('edit_collection') }}
            </b-button>
            <b-button variant="outline-danger" size="sm" class="form-control my-3"
              v-on:click="remove(collection)">{{ $t('delete_collection') }}
            </b-button>
          </div>
        </b-dropdown>
      </div>

    </div>

    <div class="collection-group">

      <b-navbar type="light" variant="light" class="border-bottom py-0">
        <b-navbar-nav class="pr-auto">
          <span>{{ $tc('articles', paginationTotalRows) }}</span>
        </b-navbar-nav>
        <b-navbar-nav class="pl-3 py-2 border-left flex-row">
          <label class="mr-2">{{$t("label_display")}}</label>
          <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-navbar-nav>
      </b-navbar>



      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12" v-for="(article, index) in articles" v-bind:key="article.uid">
            <search-results-list-item v-on:click="gotoArticle(article)" v-model="articles[index]" />
          </b-col>
        </b-row>

        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="4" lg="3" v-for="(article, index) in articles" v-bind:key="article.uid">
            <search-results-tiles-item v-on:click="gotoArticle(article)" v-model="articles[index]" />
            <!-- {{ article }} -->
          </b-col>
        </b-row>
      </b-container>
      <div class="fixed-pagination-footer p-1 m-0">
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
        <div class="item" v-for="entity in entities">
          {{entity}}
        </div>
      </div>
    </div>

    <div v-if="issues.length > 0" class="collection-group">
      <h4>Issues</h4>
      <div class="grid">
        <div class="item" v-for="issue in issues">
          {{issue}}
        </div>
      </div>
    </div>

    <div v-if="pages.length > 0" class="collection-group">
      <h4>Pages</h4>
      <div class="grid">
        <div class="item" v-for="page in pages">
          <open-seadragon-viewer v-model="page.iiif" />
        </div>
      </div>
    </div>

  </i-layout-section>
</template>

<script>
import Article from '@/models/Article';
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import Pagination from './modules/Pagination';

export default {
  data: () => ({
    tab: {},
    collection: new Collection(),
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
    Pagination,
  },
  computed: {
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
        return this.collection.items
          .filter(d => d.contentType === 'A')
          .map(d => new Article(d.item));
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
        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: this.collection.name,
          title: this.$t('Collection'),
        });
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
      const sure = confirm(this.$t('confirm_delete', [collection.name]));
      if (sure) {
        this.$store.dispatch('collections/DELETE_COLLECTION', collection.uid).then(() => {
          this.fetch();
        });
      }
    },
    save(collection) {
      if (collection.uid) {
        this.$store.dispatch('collections/EDIT_COLLECTION', {
          uid: collection.uid,
          name: collection.name,
          description: collection.description,
        }).then(() => {
          this.fetch();
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
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "articles": "Contains no articles | Contains one article | Contains {n} articles",
    "edit_collection": "Update Collection",
    "delete_collection": "Delete Collection",
    "confirm_delete": "Are you sure you want to delete collection '{0}'?"
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
