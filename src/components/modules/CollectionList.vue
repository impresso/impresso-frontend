<template>
  <i-layout class="collection-list">
    <i-layout-section main>
      <template v-slot:header>
        <div class="p-3 border-bottom">
          <div class="input-group input-group-sm">
            <input
              type="text"
              name=""
              :value="collectionsQ"
              class="form-control"
              v-bind:placeholder="$t('placeholder')"
              v-on:input="onQueryChange"
            />
            <div class="input-group-append">
              <i-dropdown
                v-model="orderBy"
                v-bind:options="orderByOptions"
                size="sm"
                variant="outline-primary"
              ></i-dropdown>
            </div>
          </div>

          <!-- div class="input-group input-group-sm">
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
          </div-->

          <div
            v-if="newCollectionError !== ''"
            class="alert alert-danger text-small mt-2 mb-0"
            role="alert"
          >
            {{ newCollectionError }}
          </div>
        </div>
      </template>

      <template v-slot:default>
        <div v-if="collections.length > 0">
          <div
            v-for="(collection, index) in collections"
            class="d-flex flex-row border-bottom"
            :class="{
              active: collection.uid === $route.params.collection_uid,
              'mb-4': index === collections.length - 1
            }"
            v-bind:key="index"
          >
            <div
              class="w-100 m-0 px-3 py-2 details-panel"
              v-on:click="select(collection)"
              v-bind:class="{ selected: collection.uid === $route.params.collection_uid }"
              for="collection.uid"
            >
              <div class="py-1">
                <div>
                  {{ collection.name }}
                </div>
              </div>
              <div>
                <div class="description small pb-1">
                  <span v-if="collection.description">{{ collection.description }} – </span>
                  <!-- <span v-if="collection.countItems">{{collection.countItems}} {{$t('items')}} – </span> -->
                  <span v-if="collection.creationDate">
                    {{ $t('created') }} {{ $d(collection.creationDate, 'compact') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="fetching">
          <p class="text-center small-caps p-4">{{ $t('actions.loading') }}</p>
        </div>
        <div v-else-if="collections.length === 0">
          <p class="text-center p-4" v-html="$t('no_collection')" />
        </div>
        <div v-else>
          <p class="text-center p-4" v-html="$t('no_match')" />
        </div>
      </template>
      <template v-slot:footer>
        <div v-if="paginationTotalRows > paginationPerPage" class="fixed-pagination-footer p-1 m-0">
          <pagination
            size="sm"
            v-bind:perPage="paginationPerPage"
            v-bind:currentPage="paginationCurrentPage"
            v-bind:totalRows="paginationTotalRows"
            v-on:change="onInputPagination"
            class="float-left small-caps"
          />
        </div>
      </template>
    </i-layout-section>
  </i-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import Pagination from './Pagination.vue'
import { useCollectionsStore } from '@/stores/collections'

export default defineComponent({
  props: {
    method: { type: Function }
  },
  data: () => ({
    isDisabled: false,
    fetching: false,
    inputNew: '',
    newCollectionError: ''
  }),
  components: {
    Pagination
  },
  computed: {
    ...mapStores(useCollectionsStore),
    paginationPerPage() {
      return this.collectionsStore.collectionsPaginationPerPage
    },
    paginationCurrentPage: {
      get() {
        return this.collectionsStore.collectionsPaginationCurrentPage
      },
      set(val) {
        this.collectionsStore.updatePaginationListCurrentPage(val)
      }
    },
    paginationTotalRows() {
      return this.collectionsStore.collectionsPaginationTotalRows
    },
    orderBy: {
      get() {
        return this.collectionsStore.collectionsOrderBy
      },
      set(val) {
        this.collectionsStore.setCollectionsSortOrder(val)
      }
    },
    collectionsQ: {
      get() {
        return this.collectionsStore.collectionsQ
      },
      set(val) {
        this.collectionsStore.setCollectionsQ(val)
      }
    },
    orderByOptions() {
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
          text: `${this.$t('last-edited')}`
        },
        {
          value: '-size',
          text: `${this.$t('-size')}`
        },
        {
          value: 'size',
          text: `${this.$t('size')}`
        }
      ]
    },
    collections() {
      return this.collectionsStore.collections
    }
  },
  methods: {
    fetch() {
      this.fetching = true
      this.collectionsStore.loadCollections().then(() => {
        this.fetching = false
      })
    },
    onQueryChange(q) {
      this.collectionsQ = q.target.value
      this.fetch()
    },
    onInputPagination(page) {
      this.paginationCurrentPage = page
      this.fetch()
    },
    onInputOrder(orderBy) {
      this.orderBy = orderBy
      this.fetch()
    },
    select(collection) {
      this.$router.push({
        name: 'collection',
        params: {
          collection_uid: collection.uid !== '' ? collection.uid : undefined
        },
        query: { tab: this.$route.query.tab }
      })
    },
    onInputNew() {
      const len = this.inputNew.trim().length
      this.newCollectionError = ''

      if ((len > 0 && len < 3) || len > 50) {
        this.newCollectionError = this.$t('NotValidLength')
      }
    },
    addCollection(collectionName) {
      this.inputNew = ''
      this.onInputNew()
      this.collectionsStore
        .addCollection({
          name: collectionName.trim()
        })
        .then(res => {
          this.fetch()
          this.select(res)
        })
        .catch(e => {
          if (e.code === 400) {
            this.newCollectionError = this.$t('NotValidLength')
          } else if (e.code === 409) {
            this.newCollectionError = this.$t('name_already_exists')
          } else {
            throw e
          }
        })
    }
  },
  mounted() {
    this.fetch()
  },
  watch: {
    orderBy: {
      handler(val) {
        console.log('OB change', val)
        this.collectionsStore.setCollectionsSortOrder(val)
        this.paginationCurrentPage = 1
        this.fetch()
      }
    },
    collectionsQ: {
      handler(val) {
        this.collectionsQ = val
        this.paginationCurrentPage = 1
        this.fetch()
      }
    }
  }
})
</script>

<style lang="scss">
// @import "impresso-theme/src/scss/bootpresso.scss";
// @import "bootstrap/scss/_variables.scss";

.collection-list {
  input {
    // font-style: italic;
  }
  .details-panel:hover {
    cursor: pointer;
    // background-color: $clr-bg-secondary;
  }

  .active {
    .selection-indicator {
      // background-color: $clr-accent-secondary;
    }
    .details-panel {
      box-shadow: inset 0.15em 0 #343a40;
      background-color: #f2f2f2;
      // background-color: $clr-bg-secondary;
    }
  }
}
</style>

<i18n lang="json">
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
    "created": "created:",
    "last_edited": "Last edited",
    "items": "items",
    "no_collection": "<p><b>No personal collection found !</b></p><p>Create one ?</p>",
    "no_match": "No collection name matches your search filter.",
    "name_already_exists": "This collection label has already been used, please choose another one",
    "NotValidLength": "Please choose a label between 3 and 50 characters long"
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
