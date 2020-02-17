<template>
  <div>
    <cluster-aspects-tab :passagesCount="passageItems.length"/>
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
</template>

<script>
import ClusterAspectsTab from '@/components/modules/textReuse/ClusterAspectsTab'
import PassageDetailsPanel from '@/components/modules/textReuse/PassageDetailsPanel'
import Pagination from './modules/Pagination';

import { textReuseClusterPassages } from '@/services'
import Newspaper from '@/models/Newspaper'

const PageQueryParameter = 'passagePage'

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
      const passagePage = this.$route.query[PageQueryParameter] || 0
      return parseInt(passagePage, 10) + 1
    },
    paginationTotalRows() {
      const { total } = this.paginationInfo
      return total
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
    }
  },
  methods: {
    handlePaginationPageChanged(page) {
      const { query } = this.$route
      const updatedQuery = Object.assign({}, query, { [PageQueryParameter]: page - 1 })
      this.$router.replace({ query: updatedQuery }).catch(() => {})
    },
    async executeSearch() {
      const pageNumber = this.paginationCurrentPage - 1;

      [this.passageItems, this.paginationInfo] = await textReuseClusterPassages
	.find({ query: {
	  clusterId: this.clusterId,
	  skip: this.paginationPerPage * pageNumber,
	  limit: this.paginationPerPage
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
