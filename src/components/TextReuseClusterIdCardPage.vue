<template>
  <i-layout-section main>
    <!-- slot:header -->
    <template v-slot:header>
      <cluster-page-header :cluster="cluster" :resolution="resolution" />
    </template>


    <b-container fluid class="p-3">
      <b-row>
        <b-col>
          <base-title-bar>
            {{ timelineTitle }}
            <template v-slot:description>
              {{ timelineDescription }}
            </template>
          </base-title-bar>
          <timeline
            :values="timelineValues"
            :resolution="resolution"
            :brushable="false">
            <template v-slot="tooltipScope">
              <div v-if="tooltipScope.tooltip.item">
                {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year') }} &middot;
                <b>{{ tooltipScope.tooltip.item.w ?? 0 }}</b>
              </div>
            </template>
          </timeline>
        </b-col>
      </b-row>

      <b-row>
        <b-col sm="12" md="12" lg="12" xl="6"
          v-for="(facet, index) in barFacets"
          :key="`bar-${index}`">
          <stacked-bars-panel
            class=""
            :label="facet.type"
            :buckets="facet.buckets"
            :facet-type="facet.type"/>
        </b-col>
      </b-row>
    </b-container>

  </i-layout-section>
</template>

<script>
import ClusterPageHeader from '@/components/modules/textReuse/ClusterPageHeader.vue'
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'
import Timeline from '@/components/modules/Timeline.vue'
import BaseTitleBar from '@/components/base/BaseTitleBar.vue';
import Helpers from '@/plugins/Helpers';

import { textReuseClusters as textReuseClustersService } from '@/services'
import FacetModel from '@/models/Facet'

const TimelineFacetTypes = Object.freeze(['date'])

/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 * @typedef {import('@/models').Facet} Facet
 */

export default {
  data: () => ({
    isLoading: false,
    facets: /** @type {Facet[]} */ ([]),
    resolution: 'year'
  }),
  props: {
    /** @type {import('vue').PropOptions<TextReuseCluster>} */
    cluster: {
      type: Object
    }
  },
  components: {
    ClusterPageHeader,
    StackedBarsPanel,
    Timeline,
    BaseTitleBar
  },
  computed: {
    /** @return {string} */
    timelineTitle() {
      return this.$t(`label.${this.resolution}.optionsTitle`)
    },
    /** @return {string} */
    timelineDescription() {
      return this.$t(`label.${this.resolution}.optionsDescription`)
    },
    /** @return {string} */
    clusterId() {
      return this.cluster?.id
    },
    /** @returns {Facet[]} */
    barFacets() {
      return this.facets.filter(({ type }) => !TimelineFacetTypes.includes(type))
    },
    /** @returns {any[]} */
    timelineValues() {
      const dateFacet = this.facets.find(({ type }) => type === 'date')
      if (dateFacet == null) return []
      return Helpers.timeline.fromBuckets(dateFacet?.buckets, this.resolution)
    },
  },
  watch: {
    clusterId: {
      async handler(id) {
        if (id == null) return
        this.isLoading = true
        try {
          const response = await textReuseClustersService.get(this.cluster.id, { query: { include_details: true }})
          const facets = response?.details?.facets ?? []
          this.resolution = response?.details?.resolution
          this.facets = facets.map(facet => new FacetModel(facet))
        } finally {
          this.isLoading = false
        }
      },
      immediate: true
    }
  }
}
</script>
