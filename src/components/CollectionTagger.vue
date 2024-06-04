<template lang="html">
  <div v-if="isLoggedIn()" class="collection-tagger">
    <a v-on:click.prevent="toggle" href="#">Save</a>
    <div class="overlay" v-show="show">
      <div class="panel">
        <div class="header">
          <router-link class="btn btn-sm btn-primary" v-bind:to="{ name: 'collection'}">Manage collections</router-link>
          <a v-on:click.prevent="toggle" href="#" class='btn btn-sm btn-dark'><icon name="times"/></a>
        </div>
        <div class="body">
          <label for="">Order by</label>
          <select v-model="collectionsSortOrder">
            <option value="name">A-Z</option>
            <option value="-name">Z-A</option>
            <option value="created">Oldest</option>
            <option value="-created">Newest</option>
            <option value="-modified">Last Edit</option>
          </select>
          <hr>
          <ul class="list-unstyled">
            <li v-for="(collection, index) in collections" v-bind:key="index" class="form-check">
              <input
              class="form-check-input"
              type="checkbox"
              v-bind:checked="isActive(collection)"
              v-on:click="toggleActive(collection)"
              v-bind:id="collection.uid">
              <label class="form-check-label" v-bind:for="collection.uid">
                {{collection.name}}
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/times';
import { useCollectionsStore } from '@/stores/collections'
import { userUserStore } from '@/stores/user'

export default {
  data: () => ({
    show: false,
  }),
  model: {
    prop: 'item',
  },
  props: {
    item: Object,
  },
  computed: {
    ...mapStores(useCollectionsStore, userUserStore),
    collections: {
      get() {
        return this.collectionsStore.collections
      },
    },
    collectionsSortOrder: {
      get() {
        return this.collectionsStore.collectionsSortOrder
      },
      set(collectionsSortOrder) {
        this.collectionsStore.setCollectionsSortOrder(collectionsSortOrder)
      },
    },
  },
  methods: {
    isActive(needle) {
      return this.item.collections.find(collection => needle.uid === collection.uid);
    },
    toggleActive(collection) {
      const idx = this.item.collections.findIndex(c => (c.uid === collection.uid));

      if (idx >= 0) {
        this.item.collections.splice(idx, 1);
        this.collectionsStore.removeCollectionItem({
          collection,
          item: this.item,
        })
      } else {
        this.item.collections.push(collection);
        this.collectionsStore.addCollectionItem({
          collection,
          item: this.item,
        })
      }
    },
    toggle() {
      this.show = !this.show;
    },
    isLoggedIn() {
      return this.userStore.userData
    },
  },
  components: {
    Icon,
  },
};
</script>

<style scoped lang="less">

.collection-tagger {
    display: inline-block;
    .overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 10001;
        .panel {
            width: 400px;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
            left: 0;
            right: 0;
            height: 50%;
            top: 25%;
            overflow: hidden;
            background: white;
            .body {
                padding: 20px;
                overflow-y: auto;
                height: 100%;
            }

            .header {
                text-align: right;
                padding: 10px 20px;
                background: #eeeeee;
            }
        }
    }
}
</style>
