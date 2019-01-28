<template lang="">
  <i-layout-section class="" v-if="$route.params.collection_uid">

    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">

      <b-navbar-nav class="px-3 pr-auto">
        <strong>{{collection.name}}</strong>
        {{collection.description}}This is a description.
      </b-navbar-nav>

      <b-navbar-nav class="p-3 border-left flex-row">
        <b-dropdown right size="sm" variant="outline-primary" :text="$t('edit_collection')">

          <div class="modal-edit px-3 background-light">

            <label for="collectionName">Name</label>
            <input type="text" name="collectionName" class="form-control mb-3"
              v-model="collection.name">

            <label for="collectionDesc">Description</label>
            <textarea type="text" name="collectionDesc" class="form-control"
              v-model="collection.description" />

            <b-button variant="outline-primary" size="sm" class="form-control mt-3"
              v-on:click="save(collection)">{{ $t('edit_collection') }}
            </b-button>

          </div>

        </b-dropdown>

        <b-button variant="outline-danger" size="sm" class="ml-1"
          v-on:click="remove(collection)">{{ $t('delete_collection') }}
        </b-button>
      </b-navbar-nav>
    </b-navbar>

    <div class="collection-group">

      <b-navbar type="light" variant="light" class="border-bottom py-0">
        <b-navbar-nav class="pr-auto">
          <span>{{ $tc('articles', articles.length) }}</span>
        </b-navbar-nav>
        <b-navbar-nav class="pl-3 py-3 border-left flex-row">
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
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';

export default {
  data: () => ({
    tab: {},
    collection: new Collection(),
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
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
        return this.collection.items.filter(item => (item.labels && item.labels[0] === 'article'));
      },
    },
    issues: {
      get() {
        return this.collection.items.filter(item => (item.labels && item.labels[0] === 'issue'));
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
    getCollection() {
      this.collection = {
        uid: this.$route.params.collection_uid,
        items: [],
      };

      this.$store.dispatch('collections/LOAD_COLLECTION', this.collection).then((res) => {
        this.collection = res;
        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: this.collection.name,
          title: this.$t('Collection'),
        });
      });
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
  },
};
</script>

<style lang="scss">
.modal-edit {
  min-width: 400px;
}
.navbar-nav.flex-row {
    flex-direction: row;
    align-items: center;
    label {
      margin-bottom: 0;
      line-height: 1.5;
    }
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
