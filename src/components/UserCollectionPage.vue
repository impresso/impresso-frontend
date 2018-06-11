<template lang="html">
<main id="UserCollectionPage">
  <div class="sidebar br">
    <div class="collection-items">
      <collection-sidebar-item
        v-model="collectionAll"
        v-on:click="onClickCollection(collectionAll)"
        v-bind:class="{active: collectionAll === collection}"
        ></collection-sidebar-item>
        <collection-sidebar-item
        v-for="(c, index) in collections"
        v-model="collections[index]"
        v-on:click="onClickCollection(c)"
        v-bind:class="{active: c === collection}"
        ></collection-sidebar-item>
    </div>
  </div>
  <div class="content">
    {{collection}}
  </div>
</main>
</template>

<script>
import Collection from '@/models/Collection';
import CollectionSidebarItem from './modules/CollectionSidebarItem';

export default {
  data: () => ({
    collection: new Collection(),
    collections: [
      new Collection({
        uid: 1,
        label: 'Collection 1',
        countEntities: 100,
        countArticles: 5,
      }),
      new Collection({
        uid: 2,
        label: 'Collection 2',
        countEntities: 100,
        countArticles: 5,
      }),
      new Collection({
        uid: 3,
        label: 'Collection 3',
        countEntities: 100,
        countArticles: 5,
      }),
      new Collection({
        uid: 4,
        label: 'Collection 4',
        countEntities: 100,
        countArticles: 5,
      }),
    ],
  }),
  computed: {
    collectionAll: {
      get() {
        return new Collection({
          uid: 'all',
          label: 'All Collections',
          countEntities: 10000,
          countArticles: 10000,
        });
      },
    },
  },
  mounted() {
    this.collection = this.collections.find(c => c.uid === this.$route.params.collection_uid) ||
      this.collectionAll;
  },
  watch: {
    collection: {
      handler() {
        // TODO: here we need to request the collection data from the server
      },
    },
  },
  components: {
    CollectionSidebarItem,
  },
  methods: {
    onClickCollection(collection) {
      this.collection = collection;
      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid,
        },
      });
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
        &::-webkit-scrollbar {
            display: none;
        }
    }
}
</style>
