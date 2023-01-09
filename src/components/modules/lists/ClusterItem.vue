<template>
  <div class="ClusterItem">
    <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator" />
    <ClusterDetailsPanel
      class="p-3 details-panel border-bottom"
      :cluster="item?.cluster"
      :textSample="item?.textSample"
    />
  </div>
</template>

<script>
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'

export default {
  components: {
    ClusterDetailsPanel,
  },
  props: {
    selected: Boolean,
    isObservable: Boolean,
    active: Boolean,
    showLink: Boolean,
    item: {
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
