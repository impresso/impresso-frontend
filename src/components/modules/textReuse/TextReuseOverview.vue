<template>
  <PowerVisBase :data="data" :loading="loading" @item:click="itemClicked">
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

const Visualisations = {
  tr_vs_newspapers: {},
  troverlap_vs_newspapers: {},
  trdelta_vs_newspapers: {},
  trcount_vs_newspapers: {},
  trcount_vs_time: {},
}
const VisualisationOptions = Object.keys(Visualisations)

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
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    items: [],
    visualisation: 'tr_vs_newspapers',
    visualisationOptions: VisualisationOptions,
  }),
  setup() {
    const itemClicked = () => {}
    return { itemClicked }
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
    "use_trcsize_vs_newspapers": "Cluster Sizes over Time",
    "use_troverlap_vs_newspapers" :"Text Reuse lexical Overlap between Newspaper Titles",
    "use_troverlap_vs_time": "Lexical Overlap over Time",
    "use_trdelta_vs_newspapers": "Publication Time Delta per Newspaper Title",
    "use_trcount_vs_newspapers": " Sum of Passages per Newspaper Title",
    "use_trcount_vs_time": "Sum of Passages over Time"
  }
}
</i18n>
