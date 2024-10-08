<template>
  <b-dropdown
    size="sm"
    class="AddToCollection shadow-sm rounded"
    variant="outline-secondary"
    v-on:shown="() => (show = true)"
    v-on:hidden="() => (show = false)"
    :text="title"
  >
    <div v-if="!isLoggedIn" class="p-2 bg-light">
      <b-button size="sm" class="w-100" variant="outline-primary" @click="$router.push({ name: 'login' })">
        {{ $t('login') }}
      </b-button>
    </div>
    <List
      :hide-pagination="total < paginationPerPage"
      :pagination-list="paginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <!-- <slot name="new">
          <b-button
            size="sm"
            class="shadow-sm rounded"
            variant="outline-primary"
            @click="() => $emit('create')"
          >
            {{ $t('actions.create') }}
          </b-button>
          or
        </slot> -->
        <!-- Using components -->
        <div class="input-group input-group-sm p-3">

          <b-form-input v-model="q" placeholder="search collections ..."></b-form-input>
          <div class="input-group-append">
            <b-button
              variant="outline-secondary"
              @click="() => $emit('create', { name: q })"
              size="sm"
              >{{ $t('actions.create') }}</b-button
            >
          </div>
        </div>
      </template>
      <template v-slot:default>
        <div
          class="text-small border-bottom AddToCollection_item"
          v-for="(item, i) in collections"
          :key="item.uid"
          @click="() => $emit('item:click', item)"
        >
          <span class="mr-1 text-muted">{{ i + 1 }} of {{ total }}</span>
          <ItemLabel type="collection" :item="item" />
        </div>
        <div v-if="isLoading" class="text-center p-3">
          <i-spinner />
        </div>
        <div
          v-if="!isLoading && !isPristine && !collections.length"
          class="text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center"
        >
          <slot name="empty">
            <span class="text-muted">{{ $t('no_collections_found') }}</span>
          </slot>
        </div>
      </template>
    </List>
  </b-dropdown>
</template>

<script>
import List from '../lists/List.vue'
import { collections as collectionService } from '@/services'
import Collection from '@/models/Collection'
import ItemLabel from '../lists/ItemLabel.vue'
import { mapStores } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  name: 'AddToCollection',
  components: {
    List,
    ItemLabel,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  emits: ['item:click', 'create'],
  data() {
    return {
      isPristine: true,
      show: false,
      paginationCurrentPage: 1,
      paginationPerPage: 10,
      orderBy: '-date', // '-date', 'date', '-size', 'size'
      q: '',
      total: -1,
      collections: [],
      isLoading: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    isLoggedIn() {
      return !!this.userStore.userData
    },
    paginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        perPage: this.paginationPerPage,
        totalRows: this.total,
      }
    },
    searchApiQueryParameters() {
      if (!this.show) {
        return {
          query: {},
          hash: '',
        }
      }
      const query = {
        offset: this.paginationPerPage * (this.paginationCurrentPage - 1),
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage,
        orderBy: this.orderBy,
        q: this.q,
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  methods: {
    loadCollections() {},
  },
  watch: {
    searchApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        this.isPristine = true
        if (!this.show || !this.isLoggedIn) {
          // eslint-disable-next-line
          console.debug(
            '[AddToCollection] @searchApiQueryParameters \n cannot be loaded now.... not loggedin or dialog not shown',
          )
          return
        }
        if (this.isLoading) {
          return
        }
        if (previousValue && previousValue.hash === hash) {
          return
        }
        // eslint-disable-next-line
        console.debug('[AddToCollection] @searchApiQueryParameters \n query:', query)

        const [items, total] = await collectionService
          .find({ query: this.searchApiQueryParameters.query })
          .then(response => {
            console.debug('[AddToCollection] @searchApiQueryParameters \n response:', response)
            return [response.data, response.total]
          })

        this.collections = items.map(
          d =>
            new Collection({
              creationDate: d.creation_date,
              lastModifiedDate: d.last_modified_date,
              countArticles: d.count_articles,
              ...d,
            }),
        )
        this.total = total
        this.isPristine = false
      },
      immediate: false,
    },
  },
}
</script>
<style lang="scss">
.AddToCollection {
  .dropdown-menu {
    min-width: 300px;
  }
  h2 {
    font-size: inherit;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-family: var(--font-family-heading);
  }

  .items {
    height: 200px;

    overflow: scroll;
  }
}
.AddToCollection_item {
  display: block;
  padding: var(--spacing-2) var(--spacing-3);

  border-bottom: 1px solid;
  &:hover {
    background-color: var(--primary);
    color: var(--white);
  }

  &:hover .text-muted {
    color: var(--white);
  }
}
</style>
<i18n lang="json">
  {
    "en": {
      "no_collections_found": "No collections found",
      "actions": {
        "create": "new..."
      }
    }
  }
</i18n>
