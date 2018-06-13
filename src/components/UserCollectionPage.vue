<template lang="html">
<main id="UserCollectionPage">
  <div class="sidebar br">
    <b-input-group>
      <b-form-input v-model="search" placeholder="Search"></b-form-input>
        <button class="btn btn-info" v-on:click="add()">Add</button>
    </b-input-group>
    <div class="collection-items">
      <collection-sidebar-item
        v-model="collectionAll"
        v-on:click="select(collectionAll)"
        v-bind:class="{active: collectionAll === collection}"
        ></collection-sidebar-item>
        <collection-sidebar-item
        v-for="(c, index) in collections"
        v-model="collections[index]"
        v-on:click="select(c)"
        v-bind:class="{active: c === collection}"
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
      <b-input-group v-show="collections.indexOf(collection) !== -1">
        <button class="btn btn-primary" v-on:click="edit()">EDIT</button>
        <button class="btn btn-danger" v-on:click="remove(collection)">Delete</button>
      </b-input-group>
    </div>
    <hr>
    <pre>
    {{collection}}
    </pre>
  </div>
</main>
</template>

<script>
import * as services from '@/services';

import Collection from '@/models/Collection';
import CollectionSidebarItem from './modules/CollectionSidebarItem';

export default {
  data: () => ({
    search: '',
    editMode: false,
    collection: new Collection(),
    collection_data: [],
  }),
  computed: {
    collections: {
      get() {
        return this.collection_data.filter(
          c => c.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1);
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
    this.fetch().then(() => {
      this.select(this.collections.find(c => c.uid === this.$route.params.collection_uid) ||
        this.collectionAll);
    });
  },
  watch: {
    collection: {
      handler() {
        // TODO: here we fetch the collection details
        // services.collections.get(val.uid).then((res) => {
        //   console.log(res);
        // });
      },
    },
  },
  components: {
    CollectionSidebarItem,
  },
  methods: {
    fetch() {
      return new Promise((resolve) => {
        services.collections.find().then((results) => {
          this.sortBy(results.data, 'last_modified_time');

          this.collection_data = results.data.map(result => new Collection({
            countArticles: result.count_articles,
            countEntities: result.count_entities,
            countIssues: result.count_issues,
            countPages: result.count_pages,
            creationDate: result.creation_date,
            creationTime: result.creation_time,
            lastModifiedDate: result.last_modified_date,
            lastModifiedTime: result.last_modified_time,
            ...result,
          }));

          resolve(results);
        });
      });
    },
    select(collection) {
      this.editMode = false;
      if (collection instanceof Collection) {
        this.collection = collection;
      } else {
        this.collection = this.collections.find(c => c.uid === collection);
      }

      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined,
        },
      });
    },
    cancel(collection) {
      this.fetch().then(() => {
        this.select(collection.uid); // select the newly created item
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
        services.collections.remove(collection.uid).then(() => {
          this.select(this.collectionAll);
        });
      }
    },
    save(collection) {
      if (collection.uid) {
        services.collections.patch(collection.uid, {
          name: collection.name,
          description: collection.description,
        }).then(() => {
          this.fetch().then(() => {
            this.select(collection.uid); // select the edited item
          });
        });
      } else {
        services.collections.create({
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          this.fetch().then(() => {
            this.select(res.data.uid); // select the newly created item
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
