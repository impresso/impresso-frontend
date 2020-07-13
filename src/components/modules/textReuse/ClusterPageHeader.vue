<template>
  <div v-if="cluster && cluster.id">
    <b-navbar >
      <section>
        <span class="label small-caps">
          <span>&larr; {{$t("clustersLabel")}}</span>
        </span>
        <info-button class="ml-2" name="text-reuse"/>
        <h3>{{$t('clusterLabel')}} #{{clusterIdLabel}}</h3>
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
      </template>
    </b-tabs>

    <slot name="toolbar"></slot>

  </div>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'

const TabsIds = Object.freeze({
  Details: 'details',
  Passages: 'passages',
  ConnectedClusters: 'connectedClusters'
})

const TabToPageMapping = Object.freeze({
  [TabsIds.Details]: 'text-reuse-cluster-detail',
  [TabsIds.Passages]: 'text-reuse-cluster-passages'
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

<i18n>
{
  "en": {
    "tabs": {
      "details": "Details",
      "passages": "Passages | 1 Passage | {count} passages"
    },
    "clustersLabel": "Clusters",
    "clusterLabel": "Cluster"
  }
}
</i18n>
