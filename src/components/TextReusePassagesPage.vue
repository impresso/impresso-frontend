<template>
  <div>
    <cluster-aspects-tab :passagesCount="passages.length"/>
    <section class="p-2">
      <passage-details-panel
        v-for="passage in passages"
        :key="passage.id"
        :passage="passage"
        class="p-2"/>
    </section>
  </div>
</template>

<script>
import ClusterAspectsTab from '@/components/modules/textReuse/ClusterAspectsTab'
import PassageDetailsPanel from '@/components/modules/textReuse/PassageDetailsPanel'

import { textReuseClusterPassages } from '@/services'

export default {
  data: () => ({
    passages: [],
  }),
  components: {
    ClusterAspectsTab,
    PassageDetailsPanel,
  },
  computed: {
    clusterId() {
      return this.$route.query.clusterId
    }
  },
  watch: {
    clusterId: {
      async handler() {
        this.passages = await textReuseClusterPassages
          .find({ query: { clusterId: this.clusterId }})
          .then(result => result.passages)
      },
      immediate: true
    }
  }
}
</script>
