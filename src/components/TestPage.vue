<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right p-2">
      <div slot="header">
        <autocomplete v-on:submit="submit" />
      </div>
      <div class="p-4">
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
      <!-- {{submitted}} -->
      <!-- <histogram-slider
        class="histo-slider"
        @changed="onSliderValueChanged"
        :buckets="sliderBuckets"
        :only-range-labels="true"
        :scale-type="'linear'"/> -->
      <!-- <time-punchcard-chart
        :data="testChartData"/> -->
      <open-seadragon-article-viewer
        :pages="testArticlePages"
        @page-changed="handlePageChanged"/>
    </i-layout-section>
  </i-layout>
</template>

<script>
import * as d3 from 'd3'
import Autocomplete from './Autocomplete';
// import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart';
// import HistogramSlider from '@/components/modules/vis/HistogramSlider';
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer'

export default {
  data: () => ({
    submitted: false,
    testChartData: /** @type {import('@/d3-modules/TimePunchcardChart').ChartData} */ ({
      categories: [...Array(6).keys()].map((categoryIndex) => {
        const minDate = new Date('2010-01-01')
        const maxDate = new Date('2012-01-01')
        let startTime = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()))
        const OneMonth = 1000 * 60 * 60 * 24 * 30
        startTime = d3.timeMonth.floor(startTime)

        return {
          dataPoints: [...Array(10).keys()].map((_, index) => {
            const value = index === 0 ? 100 : 20 + Math.random() * 80
            const time = d3.timeMonth.round(new Date(startTime.getTime() + (OneMonth * index)))
            if (time.getTime() > maxDate.getTime()) return undefined
            return { time, value }
          }).filter(v => v != null),
          isSubcategory : categoryIndex % 2 === 1
        }
      })
    }),
    sliderBuckets: Array.from({length: 50}, (_, i) =>  ({ val: i, count: Math.random() * 1000 })),
    testArticlePages: [
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0001',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0002',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0003',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0004',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0005',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0006',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0007',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0008',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0009',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0010',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0011',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0012',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0013',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0014',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0015',
      'https://impresso-project.ch/api/proxy/iiif/SMZ-1978-01-11-a-p0016'
    ]
  }),
  methods: {
    submit(suggestion) {
      this.submitted = suggestion;
    },
    onSliderValueChanged(/* value */) {
      // console.info(`Slider value changed: ${value}`);
    },
    handlePageChanged(pageIndex) {
      console.info('Current page', pageIndex)
    }
  },
  components: {
    Autocomplete,
    OpenSeadragonArticleViewer,
    // TimePunchcardChart,
    // HistogramSlider
  },
};
</script>

<style lang="scss" scoped>
  .histo-slider {
    width: 300px;
    // border: 1px dashed red;
    margin: 0;
  }
</style>