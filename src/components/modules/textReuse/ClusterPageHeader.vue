<template>
  <div v-if="cluster && cluster.id">
    <b-navbar >
      <section>
        <span class="label small-caps">
          <span>{{$t("clustersLabel")}}</span>
        </span>
        <info-button class="ml-2" name="text-reuse"/>
        <h3>{{$t('clusterLabel')}} #{{clusterIdLabel}} </h3>
        <div class="cluster-metadata">
          <p class="m-0" v-html="$tc('numbers.articles', cluster.clusterSize, { n : $n(cluster.clusterSize) })" />
          <p class="m-0">
            <span v-html="$t('clusterMetadata', {
              from: $d(fromTime, 'short'),
              to: $d(toTime, 'short'),
              span: timeSpan,
              lexicalOverlap: $n(lexicalOverlap / 100, 'percent')
            })"/>
            <info-button name="text-reuse-cluster-metadata" class="ml-2" />
          </p>
        </div>
      </section>
    </b-navbar>

    <b-tabs pills class="mx-3">
      <template v-slot:tabs-end>
        <b-nav-item class="pl-2"
          :active="$route.name === TabToPageMapping[TabsIds.Details]"
          :to="tabNavigation(TabsIds.Details)">
          {{$tc('tabs.details')}}
        </b-nav-item>

        <b-nav-item class="pl-2"
          :active="$route.name === TabToPageMapping[TabsIds.Passages]"
          :to="tabNavigation(TabsIds.Passages)">
          {{$tc('tabs.passages', cluster.clusterSize, { count: cluster.clusterSize })}}
        </b-nav-item>

        <b-nav-item class="pl-2"
          :active="$route.name === TabToPageMapping[TabsIds.ConnectedClusters]"
          :to="tabNavigation(TabsIds.ConnectedClusters)">
          {{$tc('tabs.connectedClusters', cluster.connectedClustersCount, { count: cluster.connectedClustersCount })}}
        </b-nav-item>

      </template>
    </b-tabs>

    <slot name="toolbar"></slot>

  </div>
</template>

<script>
import InfoButton from '@/components/base/InfoButton.vue'

const TabsIds = Object.freeze({
  Details: 'details',
  Passages: 'passages',
  ConnectedClusters: 'connectedClusters'
})

const TabToPageMapping = Object.freeze({
  [TabsIds.Details]: 'text-reuse-cluster-detail',
  [TabsIds.Passages]: 'text-reuse-cluster-passages',
  [TabsIds.ConnectedClusters]: 'text-reuse-connected-clusters'
})


/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 */
export default {
  data: () => ({
    TabsIds,
    TabToPageMapping
  }),
  props: {
    /** @type {import('vue').PropOptions<TextReuseCluster>} */
    cluster: {
      type: Object
    }
  },
  components: {
    InfoButton
  },
  computed: {
    /** @returns {string} */
    clusterIdLabel() {
      if (this.cluster && this.cluster.id) {
        const parts = this.cluster.id.split('-')
        return parts[parts.length - 1]
      }
      return ''
    },
    /** @returns {number} */
    timeSpan() {
      if (this.cluster == null || this.cluster?.timeCoverage == null) return 0
      const { from, to } = this.cluster?.timeCoverage ?? {}
      const fromDate = new Date(from)
      const toDate = new Date(to)
      const diffMs = toDate.getTime() - fromDate.getTime()
      // if (this.resolution === 'day') return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      // if (this.resolution === 'month') return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30))
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 365))
    },
    /** @returns {Date} */
    fromTime() {
      if (this.cluster?.timeCoverage == null) return new Date()
      return new Date(this.cluster?.timeCoverage?.from)
    },
    /** @returns {Date} */
    toTime() {
      if (this.cluster?.timeCoverage == null) return new Date()
      return new Date(this.cluster?.timeCoverage?.to)
    },
    /** @returns {number} */
    lexicalOverlap() {
      return this.cluster?.lexicalOverlap ?? 0
    }
  },
  methods: {
    /** @returns {any} */
    tabNavigation(tabName) {
      const name = TabToPageMapping[tabName]
      return {
        name,
        params: this.$route.params,
        query: this.$route.query
      }
    }
  }
}
</script>

<style lang="scss">
.cluster-metadata{
  span.number{
    font-weight: bold;
  }
  .date{
    font-variant: small-caps;
    text-transform: lowercase;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "tabs": {
      "details": "overview",
      "passages": "Passages | 1 Passage | {count} passages",
      "connectedClusters": "No Connected Clusters | 1 Connected Cluster | {count} Connected Clusters"
    },
    "clustersLabel": "text reuse clusters",
    "clusterLabel": "Cluster",
    "clusterMetadata": "from <span class='date'>{from}</span> to <span class='date'>{to}</span> (<span class='number'>{span}</span> years) with <span class='number'>{lexicalOverlap}</span> lexical overlap"
  }
}
</i18n>
