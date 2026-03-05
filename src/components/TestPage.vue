<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right p-2">
      <template v-slot:header>
        <autocomplete v-on:submit="submit" />
      </template>
      <div class="p-4"></div>
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
        :regions="testRegions"
        :defaultCurrentPageIndex="19"
        @page-changed="handlePageChanged"
        @article-selected="handleArticleSelected"
      />
    </i-layout-section>
  </i-layout>
</template>

<script>
import * as d3 from 'd3'
import Autocomplete from './Autocomplete.vue'
// import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart.vue';
// import HistogramSlider from '@/components/modules/vis/HistogramSlider.vue';
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'

export default {
  data: () => ({
    submitted: false,
    testChartData: /** @type {import('@/d3-modules/TimePunchcardChart').ChartData} */ ({
      categories: [...Array(6).keys()].map(categoryIndex => {
        const minDate = new Date('2010-01-01')
        const maxDate = new Date('2012-01-01')
        let startTime = new Date(
          minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime())
        )
        const OneMonth = 1000 * 60 * 60 * 24 * 30
        startTime = d3.timeMonth.floor(startTime)

        return {
          dataPoints: [...Array(10).keys()]
            .map((_, index) => {
              const value = index === 0 ? 100 : 20 + Math.random() * 80
              const time = d3.timeMonth.round(new Date(startTime.getTime() + OneMonth * index))
              if (time.getTime() > maxDate.getTime()) return undefined
              return { time, value }
            })
            .filter(v => v != null),
          isSubcategory: categoryIndex % 2 === 1
        }
      })
    }),
    sliderBuckets: Array.from({ length: 50 }, (_, i) => ({ val: i, count: Math.random() * 1000 })),
    testArticlePages: [
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0001',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0002',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0003',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0004',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0005',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0006',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0007',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0008',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0009',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0010',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0011',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0012',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0013',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0014',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0015',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0016',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0017',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0018',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0019',
      'https://impresso-project.ch/api/proxy/iiif/EXP-1973-08-27-a-p0020'
    ],
    testRegions: [
      {
        articleId: 'EXP-1973-08-27-a-i0370',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 31,
          y: 1451,
          w: 554,
          h: 84
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0370',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 24,
          y: 1546,
          w: 271,
          h: 528
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0370',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 317,
          y: 1549,
          w: 268,
          h: 181
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0373',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 310,
          y: 1779,
          w: 276,
          h: 56
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0373',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 310,
          y: 1835,
          w: 276,
          h: 307
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0377',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 37,
          y: 468,
          w: 849,
          h: 56
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0377',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 34,
          y: 532,
          w: 269,
          h: 360
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0377',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 324,
          y: 534,
          w: 269,
          h: 358
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0377',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 612,
          y: 534,
          w: 271,
          h: 363
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0368',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1195,
          y: 588,
          w: 545,
          h: 46
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0368',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1193,
          y: 648,
          w: 266,
          h: 115
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0368',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1481,
          y: 648,
          w: 268,
          h: 321
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0371',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 51,
          y: 2139,
          w: 215,
          h: 59
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0371',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 51,
          y: 2106,
          w: 215,
          h: 33
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0371',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 22,
          y: 2200,
          w: 269,
          h: 339
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0376',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 901,
          y: 881,
          w: 268,
          h: 282
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0376',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1190,
          y: 883,
          w: 269,
          h: 280
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0376',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 939,
          y: 1485,
          w: 513,
          h: 30
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0375',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1487,
          y: 1059,
          w: 246,
          h: 90
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0375',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1493,
          y: 1005,
          w: 240,
          h: 54
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0375',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1488,
          y: 1163,
          w: 247,
          h: 552
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0375',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1484,
          y: 1720,
          w: 248,
          h: 397
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0375',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1479,
          y: 2117,
          w: 249,
          h: 394
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0372',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 612,
          y: 2074,
          w: 828,
          h: 43
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0372',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 600,
          y: 2140,
          w: 269,
          h: 395
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0372',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 886,
          y: 2135,
          w: 276,
          h: 193
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0372',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 885,
          y: 2343,
          w: 274,
          h: 196
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0372',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1178,
          y: 2140,
          w: 269,
          h: 395
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 42,
          y: 110,
          w: 1129,
          h: 156
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 39,
          y: 270,
          w: 268,
          h: 159
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 329,
          y: 271,
          w: 267,
          h: 165
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 615,
          y: 273,
          w: 275,
          h: 161
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 901,
          y: 275,
          w: 277,
          h: 500
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0367',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1361,
          y: 522,
          w: 396,
          h: 34
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0374',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 624,
          y: 1547,
          w: 815,
          h: 102
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0374',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 603,
          y: 1659,
          w: 271,
          h: 402
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0374',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 893,
          y: 1657,
          w: 269,
          h: 402
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0374',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 1181,
          y: 1659,
          w: 269,
          h: 402
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0369',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 36,
          y: 936,
          w: 838,
          h: 50
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0369',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 29,
          y: 990,
          w: 271,
          h: 413
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0369',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 319,
          y: 992,
          w: 271,
          h: 415
        }
      },
      {
        articleId: 'EXP-1973-08-27-a-i0369',
        pageId: 'EXP-1973-08-27-a-p0020',
        coords: {
          x: 608,
          y: 995,
          w: 271,
          h: 520
        }
      }
    ]
  }),
  methods: {
    submit(suggestion) {
      this.submitted = suggestion
    },
    onSliderValueChanged(/* value */) {
      // console.info(`Slider value changed: ${value}`);
    },
    handlePageChanged(pageIndex) {
      console.info('Current page', pageIndex)
    },
    handleArticleSelected(articleId) {
      console.info('Article selected', articleId)
    }
  },
  components: {
    Autocomplete,
    OpenSeadragonArticleViewer
    // TimePunchcardChart,
    // HistogramSlider
  }
}
</script>

<style lang="scss" scoped>
.histo-slider {
  width: 300px;
  // border: 1px dashed red;
  margin: 0;
}
</style>
