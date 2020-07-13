<template>
  <i-layout-section main>
    <!-- slot:header -->
    <div slot="header">
      <cluster-page-header :cluster="cluster">
      </cluster-page-header>
    </div>

    <div>{{cluster}}</div>

  </i-layout-section>
</template>

<script>
import ClusterPageHeader from '@/components/modules/textReuse/ClusterPageHeader'

/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 */

export default {
  props: {
    /** @type {import('vue').PropOptions<TextReuseCluster>} */
    cluster: {
      type: Object,
      required: true
    }
  },
  components: {
    ClusterPageHeader
  }
}
</script>
