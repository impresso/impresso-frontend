<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <i-layout-section width="400px" class="border-right">
      <div slot="header" class="border-bottom p-2 pb-4">
        <cluster-text-search-panel/>
        <autocomplete v-on:submit="submit" />
      </div>
      <div class="p-4">
        [list of matching clusters placeholder]
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
        [connected clusters placeholder]
    </i-layout-section>
  </i-layout>
</template>

<script>
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel'

export default {
  data: () => ({
  }),
  components: {
    ClusterTextSearchPanel,
  }
};
</script>
