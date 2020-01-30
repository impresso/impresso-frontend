<template lang="html">
  <div class="d-flex flex-column">
    <!-- header -->
    <div class="d-flex flex-row border-bottom pb-1">
      <span class="label">
        {{$t('clusterLabel')}}
      </span>
      <span class="label cluster-id pl-2">
        #{{cluster.id}}
      </span>
    </div>

    <!-- subtitle -->
    <div class="d-flex flex-row justify-content-between pb-1">
      <div>
        {{$tc('articlesCount', cluster.clusterSize, { count: cluster.clusterSize })}}
      </div>
      <div>
        {{cluster.lexicalOverlap}}%
      </div>
    </div>

    <!-- text sample -->
    <div class="d-flex flex-column pb-1" v-if="textSample != null">
      <span class="label">{{$t('sampleLabel')}}</span>
      <p class="text-sample p-1">
        {{textSample}}
      </p>
    </div>

    <!-- time span -->
    <div class="d-flex flex-row" v-if="textSample != null">
      <timeline-with-span
        :height="30"
        :startDate="new Date('1818-01-01')"
        :endDate="new Date('2019-01-01')"
        :spanStartDate="new Date(cluster.timeCoverage.from)"
        :spanEndDate="new Date(cluster.timeCoverage.to)" />
    </div>
  </div>
</template>

<script>
import TimelineWithSpan from '@/components/modules/textReuse/TimelineWithSpan'

export default {
  props: {
    cluster: {
      type: Object,
      required: true,
    },
    textSample: {
      type: String
    }
  },
  components: {
    TimelineWithSpan
  }
}
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";

  .text-sample {
    background-color: $clr-grey-800;
    font-size: 12px;
    max-height: 100px;
    overflow-y: hidden;
  }
</style>

<i18n>
{
  "en": {
    "clusterLabel": "cluster",
    "articlesCount": "no articles | 1 article | {count} articles",
    "sampleLabel": "latest sample"
  }
}
</i18n>