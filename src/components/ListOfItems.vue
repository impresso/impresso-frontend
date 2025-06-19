<template>
  <div class="ListOfItems">
    <Spinner v-if="isLoading" />
    <!-- {{ searchIndex }} {{ totalItems }} -->
    <slot v-bind:items="items">
      {{ items }}
    </slot>
    <pagination
      size="sm"
      v-bind:perPage="limit"
      v-bind:currentPage="page"
      v-bind:totalRows="totalItems"
      v-on:change="handlePaginationChange"
      class="my-3 d-flex justify-content-center"
    />
  </div>
</template>

<script>
import Pagination from './modules/Pagination.vue'
import Spinner from './layout/Spinner.vue'
import { optimizeFilters } from '@/logic/filters'
import { defineComponent } from 'vue'
import {
  contentItems as contentItemsService,
  textReusePassages as textReusePassagesService
} from '@/services'

const SearchIndexToService = {
  // search: searchService,
  search: contentItemsService,
  tr_passages: textReusePassagesService
}

/** THis component will load the desired items according the the search filters and the service specified in props.
 * THis component thatkes care of the pagination and the loading of the items.
 * It will then emit the items to the parent component using the default slot and the slotProps `items`
 */

export default defineComponent({
  name: 'ListOfItems',
  components: {
    Spinner,
    Pagination
  },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    searchIndex: {
      type: String,
      default: 'search'
    },
    limit: {
      type: Number,
      default: 1
    },
    enabled: {
      type: Boolean,
      default: true
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    isLoading: false,
    items: [],
    totalItems: 0,
    page: 1
  }),
  computed: {
    service() {
      return SearchIndexToService[this.searchIndex]
    },
    apiRequestConfig() {
      const request = {
        index: this.searchIndex,
        enabled: this.enabled,
        query: {
          ...this.params,
          limit: this.limit,
          page: this.page,
          filters: optimizeFilters(this.filters)
        }
      }
      // add hash
      return {
        request,
        hash: JSON.stringify(request).split('').sort().join('')
      }
    }
  },
  watch: {
    apiRequestConfig: {
      async handler({ request, hash }, previousValue) {
        if (!request.enabled) {
          return
        }
        if (previousValue && previousValue.hash === hash) {
          return
        }
        // eslint-disable-next-line
        console.debug('[ListOfItems] @apiRequestConfig \n request:', request)
        await this.loadItems(request.query)
      },
      immediate: true
    }
  },
  methods: {
    handlePaginationChange(page = 1) {
      this.page = page
    },
    async loadItems(query) {
      this.isLoading = true
      const { items, total } = await this.service
        .find(
          {
            query
          },
          { ignoreErrors: true }
        )
        .then(res => ({
          items: res.data,
          total: res.total
        }))
        .catch(err => {
          console.error(err)
          return { items: [], total: 0 }
        })
      this.items = items
      this.totalItems = total
      this.isLoading = false
    }
  }
})
</script>
