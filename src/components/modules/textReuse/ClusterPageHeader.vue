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
        <b-nav-item class="pl-2" :active="true">
          {{$tc('tabs.passages', cluster.clusterSize, { count: cluster.clusterSize })}}
        </b-nav-item>
      </template>
    </b-tabs>

    <slot name="toolbar"></slot>

  </div>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'

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
  }
}
</script>

<i18n>
{
  "en": {
    "tabs": {
      "passages": "Passages | 1 Passage | {count} passages"
    },
    "clustersLabel": "Clusters",
    "clusterLabel": "Cluster"
  }
}
</i18n>
