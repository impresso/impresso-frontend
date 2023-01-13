<template>
  <PowerVisBase :data="stats" :loading="loading" @item:click="itemClicked">
    <template v-slot:header>
      <b-navbar-nav class="p-3 mb-3 ml-auto border-bottom">
        <label class="mr-2">{{ $t('visualisationType') }}</label>
        <i-dropdown
          v-model="visualisation"
          :options="
            visualisationOptions.map(value => ({
              value,
              text: $t(`use_${value}`),
            }))
          "
          class="mr-auto"
          size="sm"
          variant="outline-primary"
        ></i-dropdown>
      </b-navbar-nav>
    </template>
    <template v-slot:footer>
      <div>TextReuseOverview Footer</div>
    </template>
  </PowerVisBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PowerVisBase from '@/components/modules/vis/PowerVisBase'

import { stats } from '@/services'

const StatsQueryParams = {
  tr_vs_newspapers: {
    facet: 'newspaper',
    index: 'tr_passages',
    domain: 'time',
  },
  trcsize_vs_time: {
    facet: 'textReuseClusterSize',
    index: 'tr_passages',
    domain: 'time',
  },
  // troverlap_vs_newspapers: {},
  // trdelta_vs_newspapers: {},
  // trcount_vs_newspapers: {},
  // trcount_vs_time: {},
}
const VisualisationOptions = Object.keys(StatsQueryParams)

export default defineComponent({
  name: 'TextReuseOverview',
  components: {
    PowerVisBase,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    visualisation: {
      type: String,
      // one of the keys of StatsQueryParams
      default: 'tr_vs_newspapers',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    items: [],
    stats: {},
    statsLoading: false,
    visualisationOptions: VisualisationOptions,
  }),
  setup() {
    const itemClicked = () => {}
    return { itemClicked }
  },
  computed: {
    statsApiQueryParameters() {
      const { index, facet, domain } = StatsQueryParams[this.visualisation]
      const query = {
        index,
        facet,
        domain,
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  watch: {
    statsApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug(
          '[TextReuseOverview] @statsApiQueryParameters \n query:',
          query,
          hash,
          previousValue,
        )
        try {
          this.statsLoading = true
          this.stats = await stats.find({ query })
          // eslint-disable-next-line
          console.debug('[TextReuseOverview] @statsApiQueryParameters \n result:', this.stats)
        } finally {
          this.statsLoading = false
        }
      },
      immediate: true,
    },
  },
})
</script>
<i18n>
{
  "en": {
    "visualisationType": "Visualisation Type",
    "use_tr_vs_newspapers" :"Text Reuse between Newspaper Titles",
    "use_tr_vs_time": "Text Reuse over Time",
    "use_trcsize_vs_newspapers": "Cluster Sizes per Newspaper Title",
    "use_trcsize_vs_time": "Cluster Sizes over Time",
    "use_troverlap_vs_newspapers" :"Text Reuse lexical Overlap between Newspaper Titles",
    "use_troverlap_vs_time": "Lexical Overlap over Time",
    "use_trdelta_vs_newspapers": "Publication Time Delta per Newspaper Title",
    "use_trcount_vs_newspapers": " Sum of Passages per Newspaper Title",
    "use_trcount_vs_time": "Sum of Passages over Time"
  }
}
</i18n>
