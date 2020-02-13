<template>
  <div>
    <cluster-aspects-tab :passagesCount="passageItems.length"/>
    <section class="p-2">
      <div class="p-2 border-bottom mb-2">
  <i-dropdown v-model="orderByModel"
      :options="orderByOptions"
      size="sm"
      variant="outline-primary" />
      </div>
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
</template>

<script>
import ClusterAspectsTab from '@/components/modules/textReuse/ClusterAspectsTab'
import PassageDetailsPanel from '@/components/modules/textReuse/PassageDetailsPanel'
import Pagination from './modules/Pagination';

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
    paginationPerPage: {
      type: Number,
      default: 20
    }
  },
  components: {
    ClusterAspectsTab,
    PassageDetailsPanel,
    Pagination
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
    }
  },
  watch: {
    clusterId: {
      async handler() {
	return this.executeSearch()
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
    }
  }
}
</i18n>