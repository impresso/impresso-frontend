<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('textReuse') }}</span>
          <small><info-button name="which-text-reuse" class="text-muted"/></small>
          <h3 class="mb-1">...</h3>
        </section>
      </b-navbar>
      <b-tabs pills class="mr-3">
        <template v-slot:tabs-end>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseOverview' })"
            active-class="active"
            exact
            class="pl-2"
          >
            <span>{{ $t('routeTextReuseOverview') }}</span>
          </b-nav-item>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseClusters' })"
            active-class="active"
            class="pl-2"
          >
            <span>{{
              $tc('routeTextReuseClusters', totalClusters, { n: $n(totalClusters) })
            }}</span>
          </b-nav-item>
          <b-nav-item
            :to="goToRoute({ name: 'textReusePassages' })"
            active-class="active"
            class="pl-2"
          >
            <span>{{
              $tc('routeTextReusePassages', totalPassages, { n: $n(totalPassages) })
            }}</span>
          </b-nav-item>
        </template>
      </b-tabs>
    </template>
    <TextReuseOverview
      v-if="$route.name === 'textReuseOverview'"
      :filters="supportedFilters"
      :loading="isLoading"
    />
    <List
      v-if="$route.name === 'textReuseClusters'"
      :items="clusters"
      :pagination-list="clustersPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="p-2 ml-auto">
          <i-dropdown
            v-model="clustersOrderBy"
            :options="
              clustersOrderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`),
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </b-navbar-nav>
      </template>
      <template v-slot:default>
        <div class="d-flex flex-wrap">
          <ClusterItem v-for="item in clusters" :item="item" :key="item.cluster.id" />
        </div>
      </template>
    </List>
    <List
      v-if="$route.name === 'textReusePassages'"
      :items="passages"
      :pagination-list="passagesPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="p-2 ml-auto">
          <i-dropdown
            v-model="clustersOrderBy"
            :options="
              clustersOrderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`),
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </b-navbar-nav>
      </template>
      <template v-slot:default>
        <div class="d-flex flex-wrap">
          <TextReusePassageItem v-for="item in passages" :item="item" :key="item.id" />
        </div>
      </template>
    </List>
  </i-layout-section>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'
import List from '@/components/modules/lists/List'
import ClusterItem from '@/components/modules/lists/ClusterItem'
import TextReusePassageItem from '@/components/modules/lists/TextReusePassageItem'
import TextReuseOverview from '@/components/modules/textReuse/TextReuseOverview'
import { searchQueryGetter, mapPagination, mapOrderBy } from '@/logic/queryParams'
import { textReusePassages, textReuseClusters } from '@/services'
import { CommonQueryParameters } from '@/router/util'
import { optimizeFilters, SupportedFiltersByContext } from '@/logic/filters'
// import { serializeFilters } from '@/logic/filters'

const supportedSearchIndexFilters = filter =>
  SupportedFiltersByContext.textReusePassages.includes(filter.type)

const ClustersOrderByOptions = ['date', '-date']

export default {
  components: {
    ClusterItem,
    TextReusePassageItem,
    InfoButton,
    List,
    TextReuseOverview,
  },
  props: {
    /** @type {import('vue').PropOptions<Number>} */
    paginationPerPage: {
      type: Number,
      default: 20,
    },
  },
  data: () => ({
    clusters: [],
    totalClusters: -1,
    passages: [],
    totalPassages: -1,
    isLoading: false,
    clustersOrderByOptions: ClustersOrderByOptions,
  }),
  methods: {
    goToRoute(route) {
      return {
        ...route,
        query: {
          ...this.$route.query,
          ...route.query,
          // reset page n when switching route
          [CommonQueryParameters.PageNumber]: 1,
        },
      }
    },
    async loadClusters({ query }) {
      if (this.isLoading) {
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadClusters() \n busy.')
        return
      }
      this.isLoading = true
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] loadClusters() \n loading...')

      try {
        const [clusters, info] = await textReuseClusters
          .find({ query })
          .then(result => [result.clusters, result.info])
        this.clusters = clusters
        this.totalClusters = info.total
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadClusters() \n - total: ', this.totalClusters)
      } finally {
        this.isLoading = false
      }
    },
    async loadPassages({ query }) {
      if (this.isLoading) {
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadPassages() \n busy.')
        return
      }
      this.isLoading = true
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] loadPassages() \n loading...')

      try {
        const [passages, total] = await textReusePassages
          .find({ query })
          .then(result => [result.data, result.total])
        this.passages = passages
        this.totalPassages = total
        // eslint-disable-next-line
        console.debug(
          '[TextReuseExplorer] loadPassages() \n - total: ',
          this.totalPassages,
          passages,
        )
      } finally {
        this.isLoading = false
      }
    },
  },
  computed: {
    paginationCurrentPage: mapPagination(),
    searchQuery: {
      ...searchQueryGetter(),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
    },
    supportedFilters() {
      return this.filters.filter(supportedSearchIndexFilters)
    },
    clustersOrderBy: mapOrderBy(ClustersOrderByOptions, '-date'),
    /** @returns {{ currentPage: number, totalRows: number, perPage: number }} */
    clustersPaginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.totalClusters,
        perPage: this.paginationPerPage,
      }
    },
    /** @returns {{ currentPage: number, totalRows: number, perPage: number }} */
    passagesPaginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.totalPassages,
        perPage: this.paginationPerPage,
      }
    },
    /** @returns {{ query: any, hash: string }} */
    searchApiQueryParameters() {
      const query = {
        skip: this.paginationPerPage * (this.paginationCurrentPage - 1),
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage,
        filters: optimizeFilters(this.supportedFilters),
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
    clustersAsPowerVisData() {
      return {
        items:
          this.clusters?.map(item => {
            return {
              domain: item.cluster.timeCoverage.from,
              value: {
                mean: item.cluster.lexicalOverlap,
              },
            }
          }) ?? [],
        meta: {
          facetType: 'numeric',
          domain: 'time',
          resolution: 'day',
        },
      }
    },
  },
  watch: {
    searchApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug(
          '[TextReuseExplorer] @searchApiQueryParameters \n query:',
          query,
          hash,
          previousValue,
        )
        await this.loadClusters({ query })
        await this.loadPassages({ query })
      },
      immediate: true,
    },
  },
}
</script>
<i18n>
  {
    "en": {
      "textReuse": "text reuse",
      "routeTextReuseClusters": "no clusters available | 1 cluster | {n} clusters",
      "routeTextReusePassages": "no passages available | 1 passage | {n} passages",
      "routeTextReuseOverview": "overview"
    }
  }
  </i18n>
