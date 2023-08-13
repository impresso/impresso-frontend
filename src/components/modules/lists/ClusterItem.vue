<template>
  <div class="ClusterItem">
    <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator" />
    <pre>{{ JSON.stringify(item, null, 2) }}</pre>
    <div class="d-flex">
      <h2 class="flex-grow-1 sans">
        <span>#{{ item.shortId }}</span>
      </h2>
      <div class="lexical-overlap" v-b-tooltip.hover :title="$t('lexicalOverlap')">
        {{$n(item.lexicalOverlap / 100, { style: 'percent', maximumFractionDigits: 0 })}}
      </div>

      <span class="px-1">–</span>

      <div class="small-caps" v-html="$tc('numbers.articles', item.clusterSize, {
        n: $n(item.clusterSize),
      })"/>

    </div>
    </div>
  </div>
</template>

<script>
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'

export default {
  name: 'ClusterItem',
  components: {
    ClusterDetailsPanel,
  },
  props: {
    selected: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    item: {
      // must be an instance of TextReuseCluster
      type: Object,
    },
  },
  computed: {},
}
</script>

<style lang="css">
.ClusterItem .selection-indicator {
  width: 0.25em;
}
.ClusterItem {
  max-width: 350px;
}
</style>
