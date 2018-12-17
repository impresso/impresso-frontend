<template lang="html">
<i-layout id="UserCollectionPage">
  <i-layout-section width="400px" class="border-right">
    <div slot="header" class="pt-1 bg-light">
      <base-tabs v-model="tab" class="pl-3" v-bind:tabs="tabs"></base-tabs>
    </div>
    <collection-list v-show="tab.name === 'collections'" v-model="collection"/>
  </i-layout-section>
  <i-layout-section class="p-3" v-if="$route.params.collection_uid">

    <label class="px-2" for="collectionName">Name</label>
    <div class="input-group input-group-sm px-2 mb-3">
      <input type="text" name="collectionName" class="form-control" v-bind:value="collection.name">
      <div class="input-group-append">
        <b-button variant="outline-primary" size="sm"
          v-on:click="save(collection)"
          >
          {{ $t('update') }}
        </b-button>
      </div>
    </div>

    <label class="px-2" for="collectionDesc">Description</label>
    <div class="input-group input-group-sm px-2 mb-3">
      <input type="text" name="collectionDesc" class="form-control" v-bind:value="collection.description">
      <div class="input-group-append">
        <b-button variant="outline-primary" size="sm"
          v-on:click="save(collection)"
          >
          {{ $t('update') }}
        </b-button>
      </div>
    </div>


    <p>
      <label for="collectionDescription">Description</label>
      <input type="text" class="w-100" name="collectionDescription" v-bind:value="collection.description">
    </p>

    <pre>
      {{ collection }}
      {{user}}
    </pre>


    <div v-if="editMode">
        <input type="text" class="form-control" v-model="collection.name" />
        <textarea v-model="collection.description" class="form-control"></textarea>
        <button class="btn btn-success" v-on:click="save(collection)">Save Changes</button>
        <button class="btn btn-danger" v-on:click="cancel(collection)">Cancel</button>
    </div>
    <div v-else>
      <h1>{{collection.name}}</h1>
      <p><strong>{{collection.description}}</strong></p>
      <b-input-group v-show="collection.uid !== 'all'">
        <button class="btn btn-primary" v-on:click="edit()">EDIT</button>
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

    <div v-if="articles.length > 0" class="collection-group">
      <h4>Articles</h4>
      <div class="grid">
        <div class="item" v-for="article in articles">
          {{article}}
        </div>
      </div>
    </div>
  </i-layout-section>
</i-layout>
</template>

<script>
import Collection from '@/models/Collection';
import CollectionList from './modules/CollectionList';
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';
import BaseTabs from './base/BaseTabs';

export default {
  data: () => ({
    search: '',
    tab: {},
    editMode: false,
    collection: new Collection(),
  }),
  computed: {
    // collectionsSortOrder: {
    //   get() {
    //     return this.$store.getters['collections/collectionsSortOrder'];
    //   },
    //   set(collectionsSortOrder) {
    //     this.$store.commit('collections/SET_COLLECTIONS_SORT_ORDER', {
    //       collectionsSortOrder,
    //     });
    //   },
    // },
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
        },
        {
          label: this.$t('tabs.labels'),
          name: 'labels',
        },
      ];
    },
    user() {
      return this.$store.getters['user/user'];
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
          description: 'This shows a combination of all your custom collections',
          countArticles: articles,
          countEntities: entities,
          countPages: pages,
          countIssues: issues,
        });
      },
    },
  },
  mounted() {
    // if (!this.user()) {
    //   console.log('no user!');
    //   this.$router.push({ name: 'user', params: 'login' });
    // }
    this.$store.commit('SET_HEADER_TITLE', {
      subtitle: this.$t('collections'),
      title: `@${this.user.username}`,
    });
    this.fetch().then(() => {
      // return this.$store.dispatch('collections/LOAD_COLLECTION');
    //   this.collection = this.$store;
    //   console.log(this.collection);
    //   this.$store.dispatch('collections/LOAD_COLLECTION', this.collection).then((res) => {
    //     this.collection = res;
    //   });
    //   this.select(this.collections.find(c => c.uid === this.$route.params.collection_uid) ||
    //     this.collectionAll);
    });
  },
  components: {
    BaseTabs,
    CollectionList,
    OpenSeadragonViewer,
  },
  methods: {
    setCollection(c) {
      this.collection = c;
      console.log('das', c);
    },
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
    // select(collection) {
    //   this.editMode = false;
    //
    //   this.$router.push({
    //     name: 'collection',
    //     params: {
    //       collection_uid: collection.uid !== '' ? collection.uid : undefined,
    //     },
    //   });
    //
    //   this.collection = collection;
    //
    //   if (collection.uid !== 'all' && collection.uid !== '') {
    //     this.$store.dispatch('collections/LOAD_COLLECTION', collection).then((res) => {
    //       this.collection = res;
    //     });
    //   }
    // },
    cancel() {
      this.fetch().then(() => {
        // this.select(collection);
        this.editMode = false;
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
            // this.select(this.collectionAll);
          });
        });
      }
    },
    save(collection) {
      if (collection.uid) {
        // console.log(collection);
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

<style scoped lang="less">
#UserCollectionPage {
    .collection-group {
        margin-bottom: 45px;
        padding-bottom: 15px;
        border-bottom: 1px solid black;

        h4 {
            }
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
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "confirm_delete": "Are you sure you want to delete?",
    "tabs": {
        "collections": "My Collections",
        "searches": "My Searches",
        "labels": "My Labels"
    }
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
