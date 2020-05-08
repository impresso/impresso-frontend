<template>
  <i-layout-section main>
    <!-- slot:header -->
    <div slot="header">
      <div v-if="cluster && clusterId">
        <b-navbar >
          <section>
            <span class="label small-caps">
              <span>&larr; {{$t("clustersLabel")}}</span>
            </span>
            <info-button class="ml-2" name="text-reuse"/>
            <h3>{{$t('clusterLabel')}} #{{clusterIdLabel}}</h3>
          </section>
        </b-navbar>

        <cluster-aspects-tab :passagesCount="passageItems.length"/>

        <b-navbar type="light" variant="light" class="px-3 py-0 border-bottom">
          <b-navbar-nav>
            <b-nav-form class="p-2 border-right">
              <label class="mr-2">{{ $t('order by') }}</label>
              <i-dropdown v-model="orderByModel"
                :options="orderByOptions"
                size="sm"
                variant="outline-primary" />
            </b-nav-form>
          </b-navbar-nav>
        </b-navbar>
      </div>
    </div>

    <div v-if="!cluster" class="d-none" style="height: 100%">
      <div class="d-flex flex-row justify-content-center" style="height: 100%">
        <div class="d-flex flex-column justify-content-center">
          <span>[no cluster selected placeholder]</span>
        </div>
      </div>
    </div>
    <div v-else-if="clusterId">
      <section class="p-2">
        <passage-details-panel
          v-for="({ passage, newspaper, iiifUrls }) in passageItems"
          :key="passage.id"
          :passage="passage"
          :newspaper="newspaper"
          :iiif-url="iiifUrls[0]"
          class="p-2"/>
      </section>
      <div class="fixed-pagination-footer p-1 m-0"
         v-if="paginationTotalRows > paginationPerPage">
        <pagination
          :perPage="paginationPerPage"
          :currentPage="paginationCurrentPage"
          :totalRows="paginationTotalRows"
          v-on:change="handlePaginationPageChanged"
          class="float-left small-caps" />
      </div>
    </div>
  </i-layout-section>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'
import ClusterAspectsTab from '@/components/modules/textReuse/ClusterAspectsTab'
import PassageDetailsPanel from '@/components/modules/textReuse/PassageDetailsPanel'
import Pagination from '@/components/modules/Pagination';

import { textReuseClusterPassages } from '@/services'
import Newspaper from '@/models/Newspaper'


const QueryParameters = Object.freeze({
  Page: 'passagePage',
  OrderBy: 'passageOrderBy'
})

const SortingMethod = {
  Date: 'date'
}

export default {
  data: () => ({
    passageItems: [],
    paginationInfo: {
      limit: 20,
      offset: 0,
      total: 0
    }
  }),
  props: {
    cluster: Object,
    paginationPerPage: {
      type: Number,
      default: 20
    }
  },
  components: {
    ClusterAspectsTab,
    PassageDetailsPanel,
    Pagination,
    InfoButton,
  },
  computed: {
    clusterId() {
      return this.$route.query.clusterId
    },
    paginationCurrentPage() {
      const { [QueryParameters.Page]: passagePage = 0 } = this.$route.query
      return parseInt(passagePage, 10) + 1
    },
    paginationTotalRows() {
      const { total } = this.paginationInfo
      return total
    },
    orderByModel: {
      get() {
        return this.$route.query[QueryParameters.OrderBy] || '';
      },
      set(val) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.OrderBy]: val === '' ? undefined : val
        })
      },
    },
    orderByOptions() {
      return [
        {
          value: '',
          text: this.$t('sort.default'),
          disabled: false,
        },
        {
          value: `-${SortingMethod.Date}`,
          text: `${this.$t('sort.date')} ${this.$t('sort.desc')}`,
          disabled: false,
        },
        {
          value: SortingMethod.Date,
          text: `${this.$t('sort.date')} ${this.$t('sort.asc')}`,
          disabled: false,
        }
      ];
    },
    clusterIdLabel() {
      if (this.cluster && this.cluster.id) {
        const parts = this.cluster.id.split('-')
        return parts[parts.length - 1]
      }
      return ''
    }
  },
  watch: {
    clusterId: {
      async handler(val) {
        if(val) {
          return this.executeSearch();
        }
      },
      immediate: true
    },
    paginationCurrentPage: {
      async handler() {
        return this.executeSearch()
      },
      immediate: true
    },
    orderByModel: {
      async handler() { return this.executeSearch() }
    }
  },
  methods: {
    handlePaginationPageChanged(page) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.Page]: page - 1
      })
    },
    async executeSearch() {
      const pageNumber = this.paginationCurrentPage - 1;
      const orderBy = this.orderByModel;
      if (!this.clusterId) {
        return;
      }
      [this.passageItems, this.paginationInfo] = await textReuseClusterPassages
        .find({ query: {
          clusterId: this.clusterId,
          skip: this.paginationPerPage * pageNumber,
          limit: this.paginationPerPage,
          orderBy
        }})
        .then(({ passages, info }) => {
          return [
            passages.map(({ passage, newspaper, iiifUrls }) =>({
              passage,
              newspaper: new Newspaper(newspaper),
              iiifUrls
            })),
            info
          ]
        })
    }
  }
}
</script>

<i18n>
{
  "en": {
    "sort": {
      "default": "Default",
      "date": "Date",
      "asc": "↑",
      "desc": "↓"
    },
    "clustersLabel": "Clusters",
    "clusterLabel": "Cluster"
  }
}
</i18n>
