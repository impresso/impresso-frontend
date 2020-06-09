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
      {{submitted}}
      <time-punchcard-chart :data="testChartData" />
    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart';

export default {
  data: () => ({
    submitted: false,
    testChartData: /** @type {import('@/d3-modules/TimePunchcardChart').ChartData} */ ({
      categories: [...Array(4).keys()].map(() => {
        const startTimeMs = new Date('2010-01-01').getTime() + Math.random() * (new Date('2015-01-01').getTime() - new Date('2010-01-01').getTime())
        const OneMonth = 1000 * 60 * 60 * 24 * 30

        return {
          dataPoints: [...Array(Math.round(Math.random() * 10)).keys()].map((_, index) => {
            const value = 20 + Math.random() * 50
            const time = new Date(startTimeMs + (OneMonth * index))
            return { time, value }
          })
        }
      })
    })
  }),
  methods: {
    submit(suggestion) {
      this.submitted = suggestion;
    },
  },
  components: {
    Autocomplete,
    TimePunchcardChart
  },
};
</script>
