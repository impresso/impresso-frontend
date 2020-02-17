<template lang="html">
  <div class="d-flex flex-column">
    <!-- header -->
    <div class="d-flex flex-row border-bottom pb-1 align-items-end">
      <span class="label">
	{{$t('clusterLabel')}}
      </span>
      <span class="label cluster-id pl-2 text-tertiary">
	#{{cluster.id}}
      </span>
    </div>

    <!-- subtitle -->
    <div class="d-flex flex-row justify-content-between pb-1 pt-1">
      <div class="d-flex flex-column">
	<div class="small-caps cluster-size">
	  <span class="number">{{cluster.clusterSize}}</span> {{$tc('articlesCount', cluster.clusterSize)}}
	</div>
	<div class="label small-caps timespan">
	  {{$d(new Date(cluster.timeCoverage.from), 'short')}}
	  <small>to</small>
	  {{$d(new Date(cluster.timeCoverage.to), 'short')}}
	</div>
      </div>
      <div class="d-flex flex-column align-items-end">
	<span class="number">{{$n(cluster.lexicalOverlap / 100, { style: 'percent', maximumFractionDigits: 2 })}}</span>
	<span class="label text-tertiary label-overlap small-caps flex-shrink-1">lexical overlap</span>
      </div>
    </div>

    <!-- text sample -->
    <div class="d-flex flex-column pb-1" v-if="textSample != null">
      <span class="small-caps cluster-size text-tertiary">{{$t('sampleLabel')}}</span>
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
    // background-image: linear-gradient(
    //   to bottom,
    //   rgba(darken($clr-grey-800, 50%), 0.0) 0%,
    //   rgba(darken($clr-grey-800, 50%), 0.4) 70%,
    //   rgba(darken($clr-grey-800, 50%), 0.7) 100%
    // );
    font-size: 12px;
    max-height: 7rem;
    overflow-y: hidden;
  }

  .cluster-id {
    font-size: 1.2em;
  }

  .cluster-size, .latest-sample, .label-overlap, .timespan {
    font-size: 0.8em;
  }

  .number {
    font-weight: 600;
  }
</style>

<i18n>
{
  "en": {
    "clusterLabel": "cluster",
    "articlesCount": "article | articles",
    "sampleLabel": "latest sample"
  }
}
</i18n>