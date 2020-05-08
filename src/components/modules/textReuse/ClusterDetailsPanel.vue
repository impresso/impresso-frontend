<template lang="html">
  <div class="cluster-details-panel">
    <!-- header -->
    <div class="d-flex">
      <div class="flex-grow-1">
        <div class='badge badge-language small-caps mr-1'>{{ $t('clusterLabel') }}</div>
        <span>
          #{{ clusterId }}
        </span>
      </div>
      <div class="text-right">
        <div class="lexical-overlap" v-b-tooltip.hover :title="$t('lexicalOverlap')">
          {{$n(cluster.lexicalOverlap / 100, { style: 'percent', maximumFractionDigits: 2 })}}
        </div>
      </div>
    </div>

    <!-- subtitle -->
    <div class="cluster-subtitle p-2">
      <div class="size small-caps" v-html="$tc('numbers.articles', cluster.clusterSize, {
        n: $n(cluster.clusterSize),
      })"/>
      <div class="time-coverage" v-html="$t('filters.daterange.item', {
        start: $d(new Date(cluster.timeCoverage.from), 'short'),
        end: $d(new Date(cluster.timeCoverage.to), 'short')
      })"/>
    </div>

    <div v-if="textSample != null">
      <!-- text sample -->
      <div class="my-2" >
        <span class="small-caps">{{$t('sampleLabel')}}</span>
        <ellipsis v-bind:initialHeight="80" @click.prevent.stop>
          <p class="text-sample">
            <span>{{textSample}}</span>
          </p>
        </ellipsis>
      </div>

      <!-- time span -->
      <timeline-with-span
        :height="30"
        :startDate="impressoCollectionStartDate"
        :endDate="impressoCollectionEndDate"
        :spanStartDate="new Date(cluster.timeCoverage.from)"
        :spanEndDate="new Date(cluster.timeCoverage.to)" />
    </div>
  </div>
</template>

<script>
import TimelineWithSpan from '@/components/modules/textReuse/TimelineWithSpan';
import Ellipsis from '@/components/modules/Ellipsis';

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
    TimelineWithSpan,
    Ellipsis,
  },
  computed: {
    impressoCollectionStartDate() {
      return new Date(window.impressoDocumentsDateSpan.firstDate)
    },
    impressoCollectionEndDate() {
      return new Date(window.impressoDocumentsDateSpan.lastDate)
    },
    clusterId() {
      if (this.cluster && this.cluster.id) {
        const parts = this.cluster.id.split('-')
        return parts[parts.length - 1]
      }
      return ''
    }
  }
}
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  .cluster-details-panel {
    &.selected, &:hover{
      .text-sample > span{
        background-color: #c5e8f3;
      }
    }

    .text-sample {
      & > span{
        background-color: lighten($clr-grey-800, 10%);
      }
      font-size: .9em;
      line-height: 20px;
    }

    .lexical-overlap {
      background: #dee2e6;
      border-radius: 5px;
      font-weight: normal;
      padding: 0 4px;
      font-size: .9em;
    }

    .cluster-subtitle {
      line-height: 1em;

      .date {
        text-transform: lowercase;
        font-variant: small-caps;
      }

      .time-coverage {
        font-size: 14px; // to match small-caps font-size
      }
    }

    .number {
      font-weight: 600;
    }
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
