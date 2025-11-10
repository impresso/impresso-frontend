<template>
  <div class="EntityMonitor bg-dark p-2" style="min-height: 100px">
    <!-- header -->
    <div class="d-flex mb-2 align-items-center">
      <b-tabs pills class="px-2" style="flex-grow: 1">
        <template v-slot:tabs-end>
          <b-nav-item v-for="t in tabs" :key="t" :class="{ active: tab === t }" @click="tab = t">
            <span class="nav-link" v-html="$t(`tabs_${t}_${searchIndex}`).toLowerCase()" />
          </b-nav-item>
        </template>
      </b-tabs>
    </div>
    <!-- end header -->
    <div
      style="height: 100px"
      class="d-flex align-items-center justify-content-center text-white"
      v-if="isLoading"
    >
      <div><Spinner /></div>
    </div>
    <div v-else-if="tab === 'overview'">
      <WikidataBlock :item="item" v-if="item && item.wikidataId" />

      <div class="text-center m-2 mb-3">
        <router-link
          class="btn btn-primary px-5 btn-sm"
          :to="{
            name: 'entity',
            params: {
              entity_id: this.id
            }
          }"
          @click="$emit('close')"
        >
          {{ $t('actions.detail') }}
        </router-link>
      </div>
    </div>
    <ListOfItems
      v-else-if="tab === 'results' && searchIndex === 'tr_passages'"
      :filters="filters"
      :enabled="item !== null"
      service="textReusePassages"
    >
      <template v-slot:default="items">
        <div class="d-flex justify-content-center">
          <TextReusePassageItem v-for="match in items.items" :key="match.id" :item="match" />
        </div>
      </template>
    </ListOfItems>
    <div v-else-if="item">{{ item }}</div>
  </div>
</template>

<script>
import { defineAsyncComponent, defineComponent } from 'vue'
import { optimizeFilters } from '@/logic/filters'
import { entities as entitiesService, textReusePassages } from '@/services'
import WikidataBlock from './modules/WikidataBlock.vue'
import Spinner from './layout/Spinner.vue'
import TextReusePassageItem from './modules/lists/TextReusePassageItem.vue'

export default defineComponent({
  name: 'EntityMonitor',
  props: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    searchIndex: {
      type: String,
      default: 'search'
    },
    filters: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close'],
  data: () => ({
    isLoading: false,
    item: null,
    matches: [],
    totalMatches: 0,
    tab: 'overview',
    tabs: ['overview']
  }),
  computed: {
    apiQueryParams() {
      const request = {
        tab: this.tab,
        index: this.searchIndex,
        query: {
          limit: 1,
          filters: optimizeFilters(
            [
              {
                type: this.type,
                q: [this.id]
              }
            ].concat(this.filters)
          )
        }
      }

      return {
        request,
        hash: JSON.stringify(request).split('').sort().join('')
      }
    },
    needToLoadItem() {
      return [this.tab, this.id]
    }
  },
  methods: {
    async fetchEntity() {
      this.isLoading = true
      const res = await entitiesService.get(this.id)
      this.item = res
      this.isLoading = false
    }
  },
  watch: {
    needToLoadItem: {
      handler([tab, id]) {
        if (tab !== 'overview') {
          return
        } else if (this.item === null || this.item.uid !== id) {
          console.debug('[EntityMonitor] needToLoadItem', tab, id)

          this.fetchEntity()
        }
      },
      immediate: true
    },
    apiQueryParams: {
      async handler({ request, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        if (request.tab !== 'results') {
          return false
        }
        // eslint-disable-next-line
        console.debug('[EntityMonitor] @apiQueryParams \n query:', request.query)
        this.isLoading = true

        if (this.searchIndex === 'tr_passages') {
          await textReusePassages
            .find(
              {
                query: request.query
              },
              { ignoreErrors: true }
            )
            .then(res => {
              console.info(res)
              this.matches = res.data
              this.totalMatches = res.total
            })
            .catch(err => {
              console.error(err)
            })
          this.isLoading = false
        }
      },
      immediate: true,
      deep: false
    }
  },
  components: {
    WikidataBlock,
    Spinner,
    TextReusePassageItem,
    ListOfItems: () => defineAsyncComponent(() => import('./ListOfItems.vue'))
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "tabs_overview_search": "overview",
    "tabs_results_search": "matching articles",
    "tabs_overview_tr_passages": "overview",
    "tabs_results_tr_passages": "matching passages"
  }
}
</i18n>
