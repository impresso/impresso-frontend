<template lang="html">
<main id="UserCollectionPage">
  <div class="sidebar p-3 br">
    <h3>my collections</h3>
    <b-input-group class="filters">
      <b-form-input class="filter-input" v-model="search" placeholder="Filter by collection title"></b-form-input>
        <!-- <button class="btn btn-info" v-on:click="fetch()">Reload</button> -->
        <label for="collectionsSortOrder">order by</label>
        <select v-model="collectionsSortOrder" class="dropdown">
          <option value="name">NAME (A-Z)</option>
          <option value="-name">NAME (Z-A)</option>
          <option value="created">OLDEST</option>
          <option value="-created">NEWEST</option>
          <option value="-modified">LAST MODIFIED</option>
        </select>
    </b-input-group>
    <div class="collection-items">
        <collection-sidebar-item
        v-for="(c, index) in collections"
        v-model="collections[index]"
        v-on:click="select(c)"
        v-bind:class="{active: c.uid === collection.uid}"
        ></collection-sidebar-item>
    </div>
    <div class="actions">
      <button class="btn btn-info" v-on:click="add()">Add new empty collection</button>
    </div>
    <h3>collections summary</h3>
    <div class="collection-items">
      <collection-sidebar-item
        v-model="collectionAll"
        v-on:click="select(collectionAll)"
        v-bind:class="{active: collectionAll === collection}"
        ></collection-sidebar-item>
    </div>
  </div>
  <div class="content">
    <div v-if="editMode">
        <input type="text" class="form-control" v-model="collection.name" />
        <textarea v-model="collection.description" class="form-control"></textarea>
        <button class="btn btn-success" v-on:click="save(collection)">Save</button>
        <button class="btn btn-danger" v-on:click="cancel(collection)">Cancel</button>
    </div>
    <div v-else>
      <h1>{{collection.name}}</h1>
      <p><strong>{{collection.description}}</strong></p>
      <b-input-group v-show="collection.uid !== 'all'">
        <button class="btn btn-primary" v-on:click="edit()">EDIT</button> &nbsp;
        <button class="btn btn-danger" v-on:click="remove(collection)">Delete</button>
      </b-input-group>
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
          <open-seadragon-viewer v-model="issue.iiif" />
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

    <div v-if="articles.length > 0" class="collection-group">
      <h4>Articles</h4>
      <div class="grid">
        <div class="item" v-for="article in articles">
          <h5 v-html="article.title"></h5>
          <p>{{$d(new Date(article.date), 'long')}}</p>
        </div>
      </div>
    </div>
  </div>
</main>
</template>

<script>
import Collection from '@/models/Collection';
import CollectionSidebarItem from './modules/CollectionSidebarItem';
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';

export default {
  data: () => ({
    search: '',
    editMode: false,
    collection: new Collection(),
  }),
  computed: {
    collectionsSortOrder: {
      get() {
        return this.$store.getters['collections/collectionsSortOrder'];
      },
      set(collectionsSortOrder) {
        this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', {
          collectionsSortOrder,
        });
      },
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections'].filter(
          c => c.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1);
      },
    },
    pages: {
      get() {
        return this.collection.items.filter(item => (item.labels[0] === 'page'));
      },
    },
    entities: {
      get() {
        return this.collection.items.filter(item => (item.labels[0] === 'entity'));
      },
    },
    articles: {
      get() {
        return this.collection.items.filter(item => (item.labels[0] === 'article'));
      },
    },
    issues: {
      get() {
        return this.collection.items.filter(item => (item.labels[0] === 'issue'));
      },
    },
    collectionAll: {
      get() {
        let articles = 0;
        let entities = 0;
        let issues = 0;
        let pages = 0;

        this.collections.forEach((item) => {
          articles += item.countArticles;
          entities += item.countEntities;
          issues += item.countIssues;
          pages += item.countPages;
        });

        return new Collection({
          uid: 'all',
          name: 'All Collections',
          description: 'This is a summary of all your custom collections',
          countArticles: articles,
          countEntities: entities,
          countPages: pages,
          countIssues: issues,
        });
      },
    },
  },
  mounted() {
    this.fetch().then(() => {
      this.select(this.collections.find(c => c.uid === this.$route.params.collection_uid) ||
        this.collectionAll);
    });
  },
  components: {
    CollectionSidebarItem,
    OpenSeadragonViewer,
  },
  methods: {
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
    select(collection) {
      this.editMode = false;

      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined,
        },
      });

      this.collection = collection;

      if (collection.uid !== 'all' && collection.uid !== '') {
        this.$store.dispatch('collections/LOAD_COLLECTION', collection).then((res) => {
          this.collection = res;
        });
      }
    },
    cancel(collection) {
      this.fetch().then(() => {
        this.select(collection);
      });
    },
    add() {
      this.select(new Collection());
      this.editMode = true;
    },
    edit() {
      this.editMode = true;
    },
    remove(collection) {
      const sure = confirm(this.$t('confirm_delete'));
      if (sure) {
        this.$store.dispatch('collections/DELETE_COLLECTION', collection.uid).then(() => {
          this.fetch().then(() => {
            this.select(this.collectionAll);
          });
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
          this.fetch().then(() => {
            this.select(collection); // select the edited item
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

<style scoped lang="less">
// @import "./../assets/less/style.less";
// @import "./../assets/less/components/dropdown.less";

#UserCollectionPage {
    height: 100%;
    display: grid;
    grid-template-columns: 400px auto;
    grid-template-rows: auto;
    grid-template-areas: "sidebar content";
    .sidebar {
        grid-area: sidebar;
        overflow-y: auto;
        &::-webkit-scrollbar {
            display: none;
        }
        label {
            position: relative;
            top: 3px;
            margin-right: 0.8em;
            font-variant: small-caps;
            letter-spacing: 0.05em;
        }
        h3 {
            padding-bottom: 15px;
            margin-bottom: 0;
            font-size: 1rem;
            font-variant: small-caps;
            color: rgba(0,0,0,0.6);
            font-weight: bold;
            border-bottom: 1px solid rgba(0,0,0,0.2);
        }
        .filters {
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0,0,0,0.2);
            .filter-input {
                width: 100%;
                margin: 1em 0;
            }
            .filter-input::placeholder {
                color: rgba(0,0,0,0.3);
            }
        }
        .collection-items {
            margin-top: 2px;
            border-top: 1px solid black;
        }
        .actions {
            margin: 2rem 0;
            text-align: center;
        }
    }
    .content {
        grid-area: content;
        background: #f4f5f6;
        overflow-y: auto;
        padding: 15px 30px;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .collection-group {
        margin-bottom: 45px;
        padding-bottom: 15px;
        border-bottom: 1px solid black;

        h4 {}
        .grid {
            display: grid;
            grid-gap: 15px;
            grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
            .item {
                .os-viewer {
                    height: 150px;
                    width: 100%;
                }
            }
        }
    }
}
select.dropdown {
    border: none;
    outline: 1px inset black;
    outline-offset: -1px;
}
input {
    border: 1px solid black;
    border-radius: 0;
}
.btn {
    border: 1px solid black;
    border-bottom-width: 2px;
    BACKGROUND: WHITE;
    text-transform: uppercase;
    font-size: 100%;
    color: black;
    border-radius: 0;
}
.btn:hover {
    background: rgba(0,0,0,0.1);
}
</style>

<i18n>
{
  "en": {
    "confirm_delete": "Are you sure you want to delete?"
  },
  "nl": {
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
