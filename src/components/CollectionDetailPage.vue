<template lang="">
  <i-layout-section class="p-3" v-if="$route.params.collection_uid">

    <label class="px-3" for="collectionName">Name</label>
    <div  class="input-group input-group-sm px-3 mb-3">
      <input type="text" name="collectionName" class="form-control"
        v-model="collection.name"
        >
      <div class="input-group-append">
        <b-button variant="outline-primary" size="sm"
          v-on:click="save(collection)"
          >
          {{ $t('update') }}
        </b-button>
      </div>
    </div>

    <label class="px-3" for="collectionDesc">Description</label>
    <div class="input-group input-group-sm px-3 mb-3">
      <textarea type="text" name="collectionDesc" class="form-control"
        v-model="collection.description"
        />
      <div class="input-group-append">
        <b-button variant="outline-primary" size="sm"
          v-on:click="save(collection)"
          >
          {{ $t('update') }}
        </b-button>
      </div>
    </div>

    <b-button variant="outline-danger" size="sm" class="p-2 m-3 float-right"
      v-on:click="remove(collection)">{{ $t('delete_collection') }}
    </b-button>

    <div v-if="articles.length > 0" class="collection-group">
      <h4 class="p-3">{{ $tc('articles_in', articles.length) }} <em>{{collection.name}}</em></h4>

      <b-navbar>
        <b-navbar-nav>
          <label class="mr-2">{{$t("label_display")}}</label>
          <b-nav-form>
            <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
              <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
              <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
            </b-form-radio-group>
          </b-nav-form>
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

    <hr>

    <div v-if="entities.length > 0" class="collection-group">
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
    editMode: false,
    collection: new Collection(),
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
  },
  computed: {
    tabs() {
      return [
        {
          label: this.$t('tabs.collections'),
          name: 'collections',
          active: true,
        },
        {
          label: this.$t('tabs.searches'),
          name: 'searches',
          disabled: true,
        },
        {
          label: this.$t('tabs.labels'),
          name: 'labels',
          disabled: true,
        },
      ];
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
        this.$store.dispatch('collections/DELETE_COLLECTION', collection.uid).then((res) => {
          console.log(`Collection "${collection.name}" deleted. `, res);
          this.fetch().then(() => {
            // this.select(this.collectionAll);
          });
        });
      }
    },
    save(collection) {
      if (collection.uid) {
        console.log(collection);
        this.$store.dispatch('collections/EDIT_COLLECTION', {
          uid: collection.uid,
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          console.log(res);
          this.fetch().then(() => {
            // this.select(collection); // select the edited item
          });
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
.navbar-nav {
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
    "articles_in": "No articles in | One article in | {n} articles in",
    "delete_collection": "Delete Collection",
    "confirm_delete": "Are you sure you want to delete collection '{0}'?"
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
