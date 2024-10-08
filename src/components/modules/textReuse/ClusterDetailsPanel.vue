<template>
  <div class="cluster-details-panel">
    <!-- header -->
    <div class="d-flex">
      <h2 class="flex-grow-1 sans">
        <span>#{{ clusterId }}</span>
      </h2>

      <WithTooltip class="lexical-overlap" :content="$t('lexicalOverlap')">
        {{$n(cluster.lexicalOverlap / 100, { style: 'percent', maximumFractionDigits: 0 })}}
      </WithTooltip>

      <span class="px-1">–</span>

      <div class="small-caps" v-html="$tc('numbers.articles', cluster.clusterSize, {
        n: $n(cluster.clusterSize),
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
      <WithTooltip placement="bottom" is-html :content="$t('filters.daterange.item', {
        start: $d(new Date(cluster.timeCoverage.from), 'short'),
        end: $d(new Date(cluster.timeCoverage.to), 'short')
      })">
        <timeline-with-span
          :height="30"
          :startDate="impressoCollectionStartDate"
          :endDate="impressoCollectionEndDate"
          :spanStartDate="new Date(cluster.timeCoverage.from)"
          :spanEndDate="new Date(cluster.timeCoverage.to)" />
      </WithTooltip>
    </div>
  </div>
</template>

<script>
import TimelineWithSpan from '@/components/modules/textReuse/TimelineWithSpan.vue';
import Ellipsis from '@/components/modules/Ellipsis.vue';
import WithTooltip from '@/components/base/WithTooltip.vue'

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
    WithTooltip,
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
  @import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

  .cluster-details-panel {
    h2{
      font-size: inherit;
    }
    &.selected, &:hover{
      h2 span,
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

    }

    .number {
      font-weight: 600;
    }
  }

</style>

<i18n lang="json">
{
  "en": {
    "clusterLabel": "cluster",
    "articlesCount": "article | articles",
    "sampleLabel": "latest sample"
  }
}
</i18n>
