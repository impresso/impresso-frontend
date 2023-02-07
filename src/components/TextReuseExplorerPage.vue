<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('textReuse') }}</span>
          <small><info-button name="which-text-reuse" class="text-muted"/></small>
          <h3 class="mb-1">
            <span v-if="isLoading">
              ... (loading)
            </span>
            <span v-if="$route.name === 'textReuseOverview'">
              Overview of text reuse
            </span>
            <span v-if="$route.name === 'textReusePassages'">
              List of text reuse passages
            </span>
          </h3>
          <section class="text-serif TextReuseExplorerPage_summary">
            <span v-html="incipit" />
            <SearchQuerySummary :search-query="{ filters: supportedFiltersWithItems }" />
          </section>
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
            :to="goToRoute({ name: 'textReusePassages' })"
            active-class="active"
            class="pl-2"
          >
            <span v-html="$tc('routeTextReusePassages', totalPassages, { n: $n(totalPassages) })" />
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
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
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
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
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
          <TextReusePassageItem
            :item="item"
            class="m-3 pb-4 border-bottom"
            v-for="item in passages"
            :key="item.id"
            @click="handleTextReusePassageClick"
          />
        </div>
      </template>
    </List>
  </i-layout-section>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'
import List from '@/components/modules/lists/List'
import ClusterItem from '@/components/modules/lists/ClusterItem'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary'
import TextReusePassageItem from '@/components/modules/lists/TextReusePassageItem'
import TextReuseOverview from '@/components/modules/textReuse/TextReuseOverview'
import { mapPagination, mapOrderBy } from '@/logic/queryParams'
import { textReusePassages, textReuseClusters } from '@/services'
import { CommonQueryParameters } from '@/router/util'
import { optimizeFilters, serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import FilterFactory from '@/models/FilterFactory'

const supportedSearchIndexFilters = filter =>
  SupportedFiltersByContext.textReusePassages.includes(filter.type)

const OrderByOptions = [
  'date',
  '-date',
  'clusterSize',
  '-clusterSize',
  'timeDifferenceDay',
  '-timeDifferenceDay',
  'lexicalOverlap',
  '-lexicalOverlap',
  'size',
  '-size',
]

export default {
  components: {
    ClusterItem,
    TextReusePassageItem,
    InfoButton,
    List,
    TextReuseOverview,
    SearchQuerySummary,
  },
  props: {
    /** @type {import('vue').PropOptions<Number>} */
    paginationPerPage: {
      type: Number,
      default: 20,
    },
    filtersWithItems: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Array,
      default: () => [],
    },
    withClusters: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    clusters: [],
    totalClusters: -1,
    passages: [],
    totalPassages: -1,
    isLoading: false,
    orderByOptions: OrderByOptions,
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
      this.passages = []
      this.totalPassages = 0
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
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleFiltersChanged', filters)
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters)),
      })
    },
    handleTextReusePassageClick(passage) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleTextReusePassageClick', passage)
      // filter exists, update it
      const filterExists = this.filters.some(({ type }) => type === 'textReuseCluster')
      const trcFilter = FilterFactory.create({
        type: 'textReuseCluster',
        q: passage.textReuseCluster.id,
      })
      if (filterExists) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            if (filter.type === 'textReuseCluster') {
              return trcFilter
            }
            return filter
          }),
        )
        return
      } else {
        this.handleFiltersChanged([...this.filters, trcFilter])
      }
    },
  },
  computed: {
    paginationCurrentPage: mapPagination(),
    supportedFilters() {
      return this.filters.filter(supportedSearchIndexFilters)
    },
    supportedFiltersWithItems() {
      return this.filtersWithItems.filter(supportedSearchIndexFilters)
    },
    orderBy: mapOrderBy(OrderByOptions, '-date'),
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
        orderBy: this.orderBy,
        filters: optimizeFilters(this.supportedFilters),
        addons: { newspaper: 'text' },
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
    incipit() {
      if (!this.withClusters) {
        return this.$t('textReuseSummaryIncipitWithoutClusters', {
          passages: this.$tc('routeTextReusePassages', this.totalPassages, {
            n: this.$n(this.totalPassages),
          }),
        })
      }
      const passagesLabel = this.$tc('routeTextReusePassages', this.totalPassages, {
        n: this.$n(this.totalPassages),
      })
      const clustersLabel = this.$tc('routeTextReuseClusters', this.totalClusters, {
        n: this.$n(this.totalClusters),
      })
      return this.$t('textReuseSummaryIncipit', {
        passages: passagesLabel,
        clusters: clustersLabel,
      })
    },
  },
  watch: {
    searchApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] @searchApiQueryParameters \n query:', query)
        if (this.withClusters) {
          await this.loadClusters({ query })
        }
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
      "textReuseSummaryIncipit": "{passages} in {clusters}",
      "textReuseSummaryIncipitWithoutClusters": "{passages}",
      "routeTextReuseClusters": "no clusters | <span class='number'>1</span> cluster | <span class='number'>{n}</span> clusters",
      "routeTextReusePassages": "no passages | <span class='number'>1</span> passage | <span class='number'>{n}</span> passages",
      "routeTextReuseOverview": "overview"
    }
  }
  </i18n>
<style lang="css">
.TextReuseExplorerPage_summary .number {
  font-weight: bold;
}
.TextReuseExplorerPage_summary p {
  margin: 0;
  display: inline;
}
</style>
